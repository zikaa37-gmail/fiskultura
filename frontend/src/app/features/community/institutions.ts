import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { InstitutionDialogService } from './institution-dialog';
import { Icon } from '../../shared/icon/icon';
import { FilterChange, FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { queryFilters } from '../../shared/list-filters/query-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { Pagination } from '../../shared/pagination/pagination';
import { DirectoryTab, DirectoryTabs } from './directory-tabs';
import { Institution, INSTITUTION_TYPE_ACCENTS, InstitutionType } from './institution.model';
import { InstitutionStore } from './institution.store';
import { FacilityCatalogStore } from './facility-catalog.store';
import { FacilityReportPanel } from './facility-report';

const PAGE_SIZE = 30;

const TAB_FOR: Record<InstitutionType, DirectoryTab> = { osnovna: 'osnovne', srednja: 'srednje', fakultet: 'fakulteti' };

function fold(text: string | null | undefined): string {
  return (text ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'dj');
}

function municipalityOf(item: Institution): string {
  return item.municipality ?? item.place ?? '';
}

function sorted(values: (string | null)[]): string[] {
  return [...new Set(values.filter((value): value is string => !!value))].sort((a, b) => a.localeCompare(b, 'sr'));
}

@Component({
  selector: 'app-institutions',
  imports: [MatProgressBarModule, Icon, ListFilters, ListHeader, Pagination, DirectoryTabs, FacilityReportPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section section-compact">
      <div class="container">
        <h1 class="page-title mb-3">Imenik</h1>
        <app-directory-tabs [active]="tab()">
          <app-list-filters [fields]="fields()" [values]="filters.values()" emptySummary="Sve" (filterChange)="setFilter($event)" (clearAll)="filters.clear()" />
          @if (type() !== 'fakultet' && state().items) {
            <app-facility-report [items]="scoped()" [scope]="scope()" />
          }
          @if (state().loading) {
            <mat-progress-bar mode="indeterminate" />
          }
          @if (state().error; as message) {
            <p class="form-error" role="alert">{{ message }}</p>
          }
          <app-list-header [count]="state().items ? filtered().length : null" [page]="page()" [lastPage]="lastPage()" label="Ukupno" />
          <div class="directory-grid">
            @for (item of pageItems(); track item.id) {
              <button type="button" class="directory-card institution-card" [class]="'accent-' + accent()" (click)="open(item)">
                <strong>{{ item.name }}</strong>
                @if (item.place) {
                  <span class="small muted"><app-icon name="pin" [size]="14" /> {{ item.place }}</span>
                }
              </button>
            } @empty {
              @if (state().items) {
                <p class="muted">Nema ustanova za izabrane filtere.</p>
              }
            }
          </div>
          <app-pagination [page]="page()" [lastPage]="lastPage()" (pageChange)="goToPage($event)" />
        </app-directory-tabs>
      </div>
    </section>
  `,
  styles: `
    .institution-card {
      width: 100%;
      min-height: 44px;
      text-align: left;
      font: inherit;
      color: inherit;
      cursor: pointer;
    }
    .institution-card app-icon {
      vertical-align: -2px;
    }
  `,
})
export class Institutions {
  readonly type = input.required<InstitutionType>();

  readonly #router = inject(Router);
  readonly #dialog = inject(InstitutionDialogService);
  readonly #store = inject(InstitutionStore);
  readonly #catalog = inject(FacilityCatalogStore);

  protected readonly filters = queryFilters(['oblast', 'okrug', 'opstina', 'infrastruktura', 'pretraga', 'strana']);
  protected readonly tab = computed(() => TAB_FOR[this.type()]);
  protected readonly accent = computed(() => INSTITUTION_TYPE_ACCENTS[this.type()]);
  protected readonly state = computed(() => this.#store.state(this.type())());
  readonly #all = computed(() => this.state().items ?? []);

  protected readonly fields = computed<FilterField[]>(() => {
    const { oblast: region, okrug: district } = this.filters.values();
    const all = this.#all();
    const regions = sorted(all.map((item) => item.region));
    const inRegion = all.filter((item) => !region || item.region === region);
    const districts = sorted(inRegion.map((item) => item.district));
    const municipalities = sorted(inRegion.filter((item) => !district || item.district === district).map(municipalityOf));
    return [
      ...(regions.length > 1 ? [{ key: 'oblast', label: 'Oblast', allLabel: 'Srbija i Republika Srpska', options: regions.map((value) => ({ value, label: value })) }] : []),
      { key: 'okrug', label: 'Okrug', type: 'select-search', allLabel: 'Svi okruzi', options: districts.map((value) => ({ value, label: value })) },
      { key: 'opstina', label: 'Opština / grad', type: 'select-search', allLabel: 'Sve opštine', options: municipalities.map((value) => ({ value, label: value })) },
      ...(this.type() !== 'fakultet'
        ? [{ key: 'infrastruktura', label: 'Infrastruktura', allLabel: 'Sve', options: Object.entries(this.#catalog.catalog()?.flags ?? {}).map(([value, label]) => ({ value, label })) }]
        : []),
      { key: 'pretraga', label: 'Naziv ili mesto', type: 'search' },
    ];
  });

  protected readonly scope = computed(() => {
    const { oblast, okrug, opstina } = this.filters.values();
    return Object.fromEntries(
      Object.entries({ type: this.type(), region: oblast, district: okrug, municipality: opstina }).filter((entry): entry is [string, string] => !!entry[1]),
    );
  });

  protected readonly scoped = computed(() => {
    const values = this.filters.values();
    return this.#all().filter(
      (item) =>
        (!values['oblast'] || item.region === values['oblast']) &&
        (!values['okrug'] || item.district === values['okrug']) &&
        (!values['opstina'] || municipalityOf(item) === values['opstina']),
    );
  });

  protected readonly filtered = computed(() => {
    const values = this.filters.values();
    const words = fold(values['pretraga']).split(/\s+/).filter(Boolean);
    return this.scoped().filter((item) => {
      if (values['infrastruktura'] && !item.facility_flags.includes(values['infrastruktura'])) return false;
      const haystack = fold(`${item.name} ${item.place ?? ''} ${item.municipality ?? ''}`);
      return words.every((word) => haystack.includes(word));
    });
  });
  protected readonly lastPage = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));
  protected readonly page = computed(() => Math.min(this.lastPage(), Math.max(1, Number(this.filters.values()['strana']) || 1)));
  protected readonly pageItems = computed(() => this.filtered().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE));

  constructor() {
    effect(() => this.#store.load(this.type()));
    this.#catalog.load();
  }

  protected setFilter(change: FilterChange): void {
    this.#router.navigate([], {
      queryParams: { [change.key]: change.value || null, strana: null, ...(change.key === 'okrug' ? { opstina: null } : {}), ...(change.key === 'oblast' ? { okrug: null, opstina: null } : {}) },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected goToPage(page: number): void {
    this.#router.navigate([], { queryParams: { strana: page > 1 ? page : null }, queryParamsHandling: 'merge' });
  }

  protected open(item: Institution): void {
    this.#dialog.open(item);
  }
}
