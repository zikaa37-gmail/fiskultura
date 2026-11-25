import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { DeleteService } from '../../core/delete.service';
import { formatDateTime } from '../../core/content/content.model';
import { FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { matchesSearch, queryFilters } from '../../shared/list-filters/query-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { ScrollArea } from '../../shared/scroll-area/scroll-area';
import { AdminOrganization } from './admin.model';
import { SourceFormData, SourceFormDialog } from './source-form-dialog';
import { FEED_SOURCE_TYPE_LABELS, OrganizationSource, SOURCE_MODE_LABELS, SOURCE_STATUS_LABELS } from './sources.model';

type SourceAction = 'open' | 'check' | 'edit' | 'remove';

@Component({
  selector: 'app-admin-sources',
  imports: [RouterLink, MatProgressBarModule, BUTTON_IMPORTS, ListFilters, ListHeader, OptionsMenu, ScrollArea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .source-url {
      overflow-wrap: anywhere;
    }
  `,
  template: `
    <p class="muted small mb-3">
      Svakog jutra portal čita fidove izvora sa automatskim praćenjem, a nove objave stavlja u
      <a class="inline-link" routerLink="/admin/predlozi">Predloge vesti</a>. Sajtovi i mreže iz podataka o udruženjima se ovde dodaju sami;
      Facebook i Instagram pratite ručno.
    </p>
    <app-list-filters [fields]="fields" [values]="filters.values()" emptySummary="Svi izvori" (filterChange)="filters.set($event)" (clearAll)="filters.clear()" />
    <app-list-header [count]="filtered().length">
      <button type="button" mat-flat-button (click)="openForm(null)">Dodaj izvor</button>
    </app-list-header>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <app-scroll-area label="Izvori organizacija" [fill]="true">
      <div class="admin-rows">
        @for (item of filtered(); track item.id) {
          <div class="admin-row admin-row-compact">
            <div class="admin-row-main">
              <span class="admin-row-meta">
                <span class="state-chip state-muted">{{ typeLabels[item.type] }}</span>
                <span class="state-chip" [class]="item.mode === 'auto' ? 'state-ok' : 'state-muted'">{{ modeLabels[item.mode] }}</span>
                @if (item.last_status; as status) {
                  <span class="state-chip" [class]="status === 'ok' ? 'state-ok' : 'state-warn'">{{ statusLabels[status] }}</span>
                }
                @if (item.last_checked_at) {
                  <span>provereno {{ dateTime(item.last_checked_at) }}@if (item.last_status === 'ok') { · novih {{ item.last_found }}}</span>
                }
              </span>
              <strong>{{ item.organization.name }}</strong>
              <a class="inline-link small source-url" [href]="item.url" target="_blank" rel="noopener">{{ item.url }}</a>
              @if (item.last_error) {
                <span class="small danger-text">{{ item.last_error }}</span>
              }
            </div>
            <app-options-menu [options]="menuFor(item)" [label]="'Opcije za: ' + item.url" (selected)="onAction(item, $event)" />
          </div>
        } @empty {
          @if (!resource.isLoading()) {
            <p class="muted">Nema izvora za ovaj izbor. Izvori iz podataka o udruženjima dodaju se pri prvoj jutarnjoj proveri.</p>
          }
        }
      </div>
    </app-scroll-area>
  `,
})
export class AdminSources {
  readonly #http = inject(HttpClient);
  readonly #dialog = inject(MatDialog);
  readonly #notifications = inject(NotificationService);
  readonly #delete = inject(DeleteService);

  protected readonly typeLabels = FEED_SOURCE_TYPE_LABELS;
  protected readonly modeLabels = SOURCE_MODE_LABELS;
  protected readonly statusLabels = SOURCE_STATUS_LABELS;
  protected readonly checking = signal<number | null>(null);
  protected readonly filters = queryFilters(['vrsta', 'pracenje', 'stanje', 'pretraga']);
  protected readonly fields: FilterField[] = [
    { key: 'vrsta', label: 'Vrsta', allLabel: 'Sve vrste', options: Object.entries(FEED_SOURCE_TYPE_LABELS).map(([value, label]) => ({ value, label })) },
    { key: 'pracenje', label: 'Praćenje', allLabel: 'Sve', options: Object.entries(SOURCE_MODE_LABELS).map(([value, label]) => ({ value, label })) },
    { key: 'stanje', label: 'Poslednja provera', allLabel: 'Sve', options: Object.entries(SOURCE_STATUS_LABELS).map(([value, label]) => ({ value, label })) },
    { key: 'pretraga', label: 'Pretraga (organizacija, adresa)', type: 'search' },
  ];
  protected readonly resource = httpResource<OrganizationSource[]>(() => `${API_URL}/admin/sources`);
  readonly #organizations = httpResource<AdminOrganization[]>(() => `${API_URL}/admin/organizations`);
  protected readonly filtered = computed(() => {
    const { vrsta, pracenje, stanje, pretraga } = this.filters.values();
    const items = this.resource.hasValue() ? this.resource.value() : [];
    return items.filter(
      (item) =>
        (!vrsta || item.type === vrsta) &&
        (!pracenje || item.mode === pracenje) &&
        (!stanje || item.last_status === stanje) &&
        matchesSearch(pretraga, [item.organization.name, item.url]),
    );
  });

  protected dateTime(value: string | null): string {
    return formatDateTime(value);
  }

  protected menuFor(item: OrganizationSource): MenuOption<SourceAction>[] {
    const options: MenuOption<SourceAction>[] = [];
    if (item.mode === 'auto') {
      options.push({ value: 'check', label: 'Proveri sada', icon: 'search', disabled: this.checking() === item.id });
    }
    options.push(
      { value: 'open', label: 'Otvori', icon: 'external', href: item.url },
      { value: 'edit', label: 'Izmeni', icon: 'edit' },
      { value: 'remove', label: 'Obriši', icon: 'trash', danger: true, dividerBefore: true },
    );
    return options;
  }

  protected onAction(item: OrganizationSource, action: SourceAction): void {
    if (action === 'edit') {
      this.openForm(item);
    } else if (action === 'check') {
      this.check(item);
    } else if (action === 'remove') {
      this.#delete.confirmDelete(
        { title: 'Brisanje izvora', message: `Obrisati izvor ${item.url}? Ako je u podacima o udruženju, vratiće se pri sledećoj proveri.`, url: `${API_URL}/admin/sources/${item.id}`, success: 'Izvor je obrisan.' },
        () => this.resource.reload(),
      );
    }
  }

  protected openForm(source: OrganizationSource | null): void {
    const organizations = (this.#organizations.hasValue() ? this.#organizations.value() : []).map((organization) => ({ id: organization.id, name: organization.name }));
    this.#dialog
      .open<SourceFormDialog, SourceFormData, OrganizationSource | null>(SourceFormDialog, { data: { source, organizations }, width: '520px', maxWidth: 'calc(100vw - 32px)', panelClass: 'app-dialog-panel' })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) {
          this.#notifications.show(source ? 'Izvor je sačuvan.' : 'Izvor je dodat.');
          this.resource.reload();
        }
      });
  }

  protected check(item: OrganizationSource): void {
    this.checking.set(item.id);
    this.#http.post<OrganizationSource & { found: number }>(`${API_URL}/admin/sources/${item.id}/check`, {}).subscribe({
      next: (result) => {
        this.checking.set(null);
        const status = result.last_status ? SOURCE_STATUS_LABELS[result.last_status] : 'Provereno';
        this.#notifications.show(result.last_status === 'ok' ? `${status}: novih predloga ${result.found}.` : `${status}.`);
        this.resource.reload();
      },
      error: (error) => {
        this.checking.set(null);
        this.#notifications.show(apiErrorMessage(error));
      },
    });
  }
}
