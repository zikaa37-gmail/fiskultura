import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/auth/auth.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { formatDate } from '../../core/content/content.model';
import { Regulation, REGULATION_KIND_LABELS, REGULATION_STATUS_LABELS, RegulationReview, VERIFICATION_LABELS } from '../../core/content/regulation.model';
import { RULE_TOPICS, reviewDue } from '../../content/rules/rule-topics';
import { CONTACTS_CHECKED_AT } from '../../content/rules/contacts';
import { AdminReviewRow } from './admin-review-row';
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-regulations',
  imports: [AdminReviewRow, FormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule],
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
    <div class="admin-toolbar">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="admin-search">
        <mat-label>Pretraga (naziv, glasnik)</mat-label>
        <input matInput [ngModel]="search()" (ngModelChange)="search.set($event)" />
      </mat-form-field>
      <a mat-flat-button routerLink="novi">Novi propis</a>
    </div>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <p class="muted small result-count mb-2">Ukupno: {{ filtered().length }}</p>
    <div class="admin-rows">
      @for (item of filtered(); track item.id) {
        <div class="admin-row">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              <span class="state-chip state-muted">{{ kindLabels[item.kind] }}</span>
              <span class="state-chip" [class]="item.status === 'prestao' ? 'state-muted' : 'state-ok'">{{ statusLabels[item.status] }}</span>
              <span class="state-chip" [class]="item.verification === 'unverified' ? 'state-warn' : 'state-ok'">{{ verificationLabels[item.verification] }}</span>
              <span>verzija {{ item.version }}</span>
            </span>
            <a class="post-title" [routerLink]="[item.key]">{{ item.title }}</a>
          </div>
          <div class="admin-row-actions">
            <a mat-stroked-button [routerLink]="[item.key]">Izmeni</a>
            @if (auth.isAdmin()) {
              <button type="button" mat-button class="danger-text" (click)="remove(item)">Obriši</button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminRegulations {
  protected readonly auth = inject(AuthService);
  readonly #http = inject(HttpClient);
  readonly #notifications = inject(NotificationService);
  readonly #confirm = inject(ConfirmService);

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
  protected readonly search = signal('');
  protected readonly resource = httpResource<Regulation[]>(() => `${API_URL}/regulations`);
  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const items = this.resource.hasValue() ? this.resource.value() : [];
    return term ? items.filter((item) => [item.title, item.gazette, item.key].some((value) => value?.toLowerCase().includes(term))) : items;
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

  protected remove(item: Regulation): void {
    this.#confirm.confirm({ title: 'Brisanje propisa', message: `Obrisati „${item.title}“ sa istorijom izmena?`, confirmLabel: 'Obriši' }).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.#http.delete(`${API_URL}/admin/regulations/${item.id}`).subscribe({
        next: () => {
          this.#notifications.show('Propis je obrisan.');
          this.resource.reload();
        },
        error: (error) => this.#notifications.show(apiErrorMessage(error)),
      });
    });
  }
}
