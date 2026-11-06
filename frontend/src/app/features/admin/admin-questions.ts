import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/auth/auth.service';
import { formatDate } from '../../core/content/content.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';
import { AdminQuestion, QUESTION_CATEGORY_LABELS, QUESTION_STATUS_LABELS, QuestionStatus } from '../questions/question.model';

@Component({
  selector: 'app-admin-questions',
  imports: [FormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-toolbar">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="admin-search">
        <mat-label>Pretraga (pitanje, odgovor)</mat-label>
        <input matInput [ngModel]="search()" (ngModelChange)="search.set($event)" />
      </mat-form-field>
      <a mat-flat-button routerLink="novo">Novo pitanje i odgovor</a>
    </div>
    <div class="chip-row" role="group" aria-label="Status">
      <button type="button" class="filter-chip" [class.filter-chip-on]="!status()" (click)="status.set(null)">Sva</button>
      @for (option of statuses; track option) {
        <button type="button" class="filter-chip" [class.filter-chip-on]="status() === option" [attr.aria-pressed]="status() === option" (click)="status.set(option)">
          {{ statusLabels[option] }}{{ option === 'pending' && pending() ? ' (' + pending() + ')' : '' }}
        </button>
      }
    </div>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <p class="muted small result-count mb-2">Ukupno: {{ items().length }}</p>
    <div class="admin-rows">
      @for (item of items(); track item.id) {
        <div class="admin-row">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              <span class="state-chip" [class]="item.status === 'pending' ? 'state-warn' : item.status === 'published' ? 'state-ok' : 'state-muted'">{{ statusLabels[item.status] }}</span>
              <span class="state-chip state-muted">{{ categoryLabels[item.category] }}</span>
              @if (item.asker) {
                <span>{{ item.asker.name }}</span>
              }
              @if (item.created_at) {
                <span>{{ date(item.created_at) }}</span>
              }
            </span>
            <a class="post-title" [routerLink]="[item.id]">{{ item.title }}</a>
          </div>
          <div class="admin-row-actions">
            <a mat-stroked-button [routerLink]="[item.id]">{{ item.status === 'pending' ? 'Odgovori' : 'Izmeni' }}</a>
            @if (auth.isAdmin()) {
              <button type="button" mat-button class="danger-text" (click)="remove(item)">Obriši</button>
            }
          </div>
        </div>
      } @empty {
        @if (!resource.isLoading()) {
          <p class="muted">Nema pitanja za ovaj izbor.</p>
        }
      }
    </div>
  `,
})
export class AdminQuestions {
  protected readonly auth = inject(AuthService);
  readonly #http = inject(HttpClient);
  readonly #notifications = inject(NotificationService);
  readonly #confirm = inject(ConfirmService);

  protected readonly categoryLabels = QUESTION_CATEGORY_LABELS;
  protected readonly statusLabels = QUESTION_STATUS_LABELS;
  protected readonly statuses = Object.keys(QUESTION_STATUS_LABELS) as QuestionStatus[];
  protected readonly status = signal<QuestionStatus | null>(null);
  protected readonly search = signal('');

  protected readonly resource = httpResource<{ data: AdminQuestion[]; pending: number }>(() => ({
    url: `${API_URL}/admin/questions/list`,
    method: 'POST',
    body: { status: this.status() },
  }));
  protected readonly pending = computed(() => (this.resource.hasValue() ? this.resource.value().pending : 0));
  protected readonly items = computed(() => {
    const term = this.search().trim().toLowerCase();
    const items = this.resource.hasValue() ? this.resource.value().data : [];
    return term ? items.filter((item) => [item.title, item.original, item.answer].some((value) => value?.toLowerCase().includes(term))) : items;
  });

  protected date(value: string): string {
    return formatDate(value);
  }

  protected remove(item: AdminQuestion): void {
    this.#confirm.confirm({ title: 'Brisanje pitanja', message: `Obrisati „${item.title}“?`, confirmLabel: 'Obriši' }).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.#http.delete(`${API_URL}/admin/questions/${item.id}`).subscribe({
        next: () => {
          this.#notifications.show('Pitanje je obrisano.');
          this.resource.reload();
        },
        error: (error) => this.#notifications.show(apiErrorMessage(error)),
      });
    });
  }
}
