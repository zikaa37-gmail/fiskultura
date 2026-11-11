import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/auth/auth.service';
import { DeleteService } from '../../core/delete.service';
import { API_URL } from '../../core/http/api';
import { ORGANIZATION_LEVEL_LABELS, ORGANIZATION_TYPE_LABELS } from '../../core/content/content.model';
import { FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { matchesSearch, queryFilters } from '../../shared/list-filters/query-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { AdminOrganization } from './admin.model';

type RowAction = 'view' | 'edit' | 'remove';

const STATUS_OPTIONS = [
  { value: 'aktivno', label: 'Aktivno' },
  { value: 'neaktivno', label: 'Neaktivno' },
  { value: 'nepoznato', label: 'Nepoznato' },
];

@Component({
  selector: 'app-admin-organizations',
  imports: [RouterLink, BUTTON_IMPORTS, MatProgressBarModule, ListFilters, ListHeader, OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-list-filters [fields]="fields" [values]="filters.values()" emptySummary="Sve organizacije" (filterChange)="filters.set($event)" (clearAll)="filters.clear()" />
    <app-list-header [count]="filtered().length">
      <a mat-flat-button routerLink="nova">Nova organizacija</a>
    </app-list-header>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <div class="admin-rows">
      @for (item of filtered(); track item.id) {
        <div class="admin-row admin-row-compact">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              <span class="state-chip" [class]="item.status === 'aktivno' ? 'state-ok' : 'state-muted'">{{ item.status }}</span>
              <span>{{ typeLabels[item.type] }} · {{ levelLabels[item.level] }}</span>
              @if (item.city) {
                <span>· {{ item.city }}</span>
              }
              @if (item.parent; as parent) {
                <span>· članica {{ parent.short_name ?? parent.name }}</span>
              }
              <span>· vesti: {{ item.news_count ?? 0 }}</span>
            </span>
            <a class="post-title" [routerLink]="[item.id]">{{ item.name }}@if (item.short_name) { ({{ item.short_name }}) }</a>
            @if (!item.website && !item.email && !item.social.facebook) {
              <span class="small warn-text">Nema sajta, mejla ni Facebook-a</span>
            }
          </div>
          <app-options-menu [options]="menuFor(item)" [label]="'Opcije za: ' + item.name" (selected)="onAction(item, $event)" />
        </div>
      } @empty {
        @if (!resource.isLoading()) {
          <p class="muted">Nema organizacija za ovaj izbor.</p>
        }
      }
    </div>
  `,
})
export class AdminOrganizations {
  protected readonly auth = inject(AuthService);
  readonly #delete = inject(DeleteService);

  protected readonly typeLabels = ORGANIZATION_TYPE_LABELS;
  protected readonly levelLabels = ORGANIZATION_LEVEL_LABELS;
  protected readonly filters = queryFilters(['vrsta', 'nivo', 'status', 'pretraga']);
  protected readonly fields: FilterField[] = [
    { key: 'vrsta', label: 'Vrsta', allLabel: 'Sve vrste', options: Object.entries(ORGANIZATION_TYPE_LABELS).map(([value, label]) => ({ value, label })) },
    { key: 'nivo', label: 'Nivo', allLabel: 'Svi nivoi', options: Object.entries(ORGANIZATION_LEVEL_LABELS).map(([value, label]) => ({ value, label })) },
    { key: 'status', label: 'Status', allLabel: 'Svi', options: STATUS_OPTIONS },
    { key: 'pretraga', label: 'Pretraga (naziv, grad)', type: 'search' },
  ];
  protected readonly resource = httpResource<AdminOrganization[]>(() => `${API_URL}/admin/organizations`);
  protected readonly filtered = computed(() => {
    const { vrsta, nivo, status, pretraga } = this.filters.values();
    const items = this.resource.hasValue() ? this.resource.value() : [];
    return items.filter(
      (item) =>
        (!vrsta || item.type === vrsta) &&
        (!nivo || item.level === nivo) &&
        (!status || item.status === status) &&
        matchesSearch(pretraga, [item.name, item.short_name, item.city]),
    );
  });

  protected menuFor(item: AdminOrganization): MenuOption<RowAction>[] {
    const options: MenuOption<RowAction>[] = [
      { value: 'view', label: 'Pogledaj', icon: 'eye', link: ['/udruzenja', item.slug], newTab: true },
      { value: 'edit', label: 'Izmeni', icon: 'edit', link: ['/admin/udruzenja', item.id] },
    ];
    if (this.auth.isAdmin()) {
      options.push({ value: 'remove', label: 'Obriši', icon: 'trash', danger: true, dividerBefore: true });
    }
    return options;
  }

  protected onAction(item: AdminOrganization, action: RowAction): void {
    if (action === 'remove') {
      this.#delete.confirmDelete(
        {
          title: 'Brisanje organizacije',
          message: `Obrisati „${item.name}“? Njene vesti ostaju, ali bez oznake organizacije${item.news_count ? ` (${item.news_count})` : ''}.`,
          url: `${API_URL}/admin/organizations/${item.id}`,
        },
        () => this.resource.reload(),
      );
    }
  }
}
