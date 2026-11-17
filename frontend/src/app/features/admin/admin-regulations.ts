import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/auth/auth.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { formatDate } from '../../core/content/content.model';
import { Regulation, REGULATION_KIND_LABELS, REGULATION_STATUS_LABELS, RegulationReview, VERIFICATION_LABELS } from '../../core/content/regulation.model';
import { RULE_TOPICS, reviewDue } from '../../content/rules/rule-topics';
import { CONTACTS_CHECKED_AT } from '../../content/rules/contacts';
import { AdminReviewRow } from './admin-review-row';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { DeleteService } from '../../core/delete.service';
import { FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { matchesSearch, queryFilters } from '../../shared/list-filters/query-filters';
import { ListHeader } from '../../shared/list-header/list-header';

type RowAction = 'edit' | 'remove';

@Component({
  selector: 'app-admin-regulations',
  imports: [AdminReviewRow, RouterLink, BUTTON_IMPORTS, MatProgressBarModule, ListFilters, ListHeader, OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="admin-review">
      <h2>Za proveru</h2>
      <p class="muted small">
        Nedeljna provera PIS-a (ponedeljkom) javlja nove izmene propisa. Teme i kontakti se proveravaju najmanje na 6 meseci i obavezno pre 1. septembra.
      </p>
      @for (topic of dueTopics(); track topic.slug) {
        <div class="admin-row admin-row-due">
          <div class="admin-row-main">
            <span class="admin-row-meta"><span class="state-chip state-warn">tema</span> provereno {{ date(topic.checkedAt) }}</span>
            <a class="post-title" [routerLink]="['/propisi', topic.slug]">{{ topic.title }}</a>
            <span class="small muted">Rok provere je prošao: pročitati važeće propise i ažurirati temu u <code>content/rules/rule-topics.ts</code>.</span>
          </div>
        </div>
      }
      @if (contactsDue) {
        <div class="admin-row admin-row-due">
          <div class="admin-row-main">
            <span class="admin-row-meta"><span class="state-chip state-warn">kontakti</span> provereno {{ date(contactsCheckedAt) }}</span>
            <a class="post-title" routerLink="/propisi" [queryParams]="{ tab: 'kontakti' }">Kontakti institucija</a>
          </div>
        </div>
      }
      @for (item of changed(); track item.id) {
        <app-admin-review-row [regulation]="item" (checked)="markChecked($event)" />
      }
      @if (stale().length) {
        <details class="admin-review-stale">
          <summary>Propisi bez provere u poslednjih 6 meseci ({{ stale().length }})</summary>
          @for (item of stale(); track item.id) {
            <app-admin-review-row [regulation]="item" (checked)="markChecked($event)" />
          }
        </details>
      }
      @if (reviewResource.hasValue() && !changed().length && !dueTopics().length && !contactsDue) {
        <p class="small">Nema novih izmena u PIS-u ni tema sa isteklim rokom.</p>
      }
    </section>

    <h2>Svi propisi</h2>
    <app-list-filters [fields]="fields" [values]="filters.values()" emptySummary="Svi propisi" (filterChange)="filters.set($event)" (clearAll)="filters.clear()" />
    <app-list-header [count]="filtered().length">
      <a mat-flat-button routerLink="novi">Novi propis</a>
    </app-list-header>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <div class="admin-rows">
      @for (item of filtered(); track item.id) {
        <div class="admin-row admin-row-compact">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              <span class="state-chip state-muted">{{ kindLabels[item.kind] }}</span>
              <span class="state-chip" [class]="item.status === 'prestao' ? 'state-muted' : 'state-ok'">{{ statusLabels[item.status] }}</span>
              <span class="state-chip" [class]="item.verification === 'unverified' ? 'state-warn' : 'state-ok'">{{ verificationLabels[item.verification] }}</span>
              <span>verzija {{ item.version }}</span>
            </span>
            <a class="post-title" [routerLink]="[item.key]">{{ item.title }}</a>
          </div>
          <app-options-menu [options]="menuFor(item)" [label]="'Opcije za: ' + item.title" (selected)="onAction(item, $event)" />
        </div>
      } @empty {
        @if (!resource.isLoading()) {
          <p class="muted">Nema propisa za ovaj izbor.</p>
        }
      }
    </div>
  `,
})
export class AdminRegulations {
  protected readonly auth = inject(AuthService);
  readonly #http = inject(HttpClient);
  readonly #notifications = inject(NotificationService);
  readonly #delete = inject(DeleteService);

  protected readonly kindLabels = REGULATION_KIND_LABELS;
  protected readonly verificationLabels = VERIFICATION_LABELS;
  protected readonly statusLabels = REGULATION_STATUS_LABELS;
  protected readonly dueTopics = signal(RULE_TOPICS.filter((topic) => reviewDue(topic.checkedAt)));
  protected readonly contactsCheckedAt = CONTACTS_CHECKED_AT;
  protected readonly contactsDue = reviewDue(CONTACTS_CHECKED_AT);
  protected readonly reviewResource = httpResource<RegulationReview[]>(() => `${API_URL}/admin/regulations-review`);
  protected readonly review = computed(() => (this.reviewResource.hasValue() ? this.reviewResource.value() : []));
  protected readonly changed = computed(() => this.review().filter((item) => item.change_detected_at));
  protected readonly stale = computed(() => this.review().filter((item) => !item.change_detected_at));
  protected readonly filters = queryFilters(['vrsta', 'status', 'provera', 'pretraga']);
  protected readonly fields: FilterField[] = [
    { key: 'vrsta', label: 'Vrsta', allLabel: 'Sve vrste', options: Object.entries(REGULATION_KIND_LABELS).map(([value, label]) => ({ value, label })) },
    { key: 'status', label: 'Važenje', allLabel: 'Sve', options: Object.entries(REGULATION_STATUS_LABELS).map(([value, label]) => ({ value, label: capitalize(label) })) },
    { key: 'provera', label: 'Tekst', allLabel: 'Sve', options: Object.entries(VERIFICATION_LABELS).map(([value, label]) => ({ value, label: capitalize(label) })) },
    { key: 'pretraga', label: 'Pretraga (naziv, glasnik)', type: 'search' },
  ];
  protected readonly resource = httpResource<Regulation[]>(() => `${API_URL}/regulations`);
  protected readonly filtered = computed(() => {
    const { vrsta, status, provera, pretraga } = this.filters.values();
    const items = this.resource.hasValue() ? this.resource.value() : [];
    return items.filter(
      (item) =>
        (!vrsta || item.kind === vrsta) &&
        (!status || item.status === status) &&
        (!provera || item.verification === provera) &&
        matchesSearch(pretraga, [item.title, item.gazette, item.key]),
    );
  });

  protected date(value: string | null): string {
    return formatDate(value);
  }

  protected markChecked(item: RegulationReview): void {
    this.#http.post<Regulation>(`${API_URL}/admin/regulations/${item.id}/checked`, {}).subscribe({
      next: () => {
        this.#notifications.show('Propis je označen kao proveren.');
        this.reviewResource.reload();
      },
      error: (error) => this.#notifications.show(apiErrorMessage(error)),
    });
  }

  protected menuFor(item: Regulation): MenuOption<RowAction>[] {
    const options: MenuOption<RowAction>[] = [{ value: 'edit', label: 'Izmeni', icon: 'edit', link: ['/admin/propisi', item.key] }];
    if (this.auth.isAdmin()) {
      options.push({ value: 'remove', label: 'Obriši', icon: 'trash', danger: true, dividerBefore: true });
    }
    return options;
  }

  protected onAction(item: Regulation, action: RowAction): void {
    if (action === 'remove') {
      this.#delete.confirmDelete(
        { title: 'Brisanje propisa', message: `Obrisati „${item.title}“ sa istorijom izmena?`, url: `${API_URL}/admin/regulations/${item.id}`, success: 'Propis je obrisan.' },
        () => this.resource.reload(),
      );
    }
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
