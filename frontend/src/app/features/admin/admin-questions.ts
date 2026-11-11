import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/auth/auth.service';
import { formatDate } from '../../core/content/content.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { ListHeader } from '../../shared/list-header/list-header';
import { AdminQuestion, QUESTION_CATEGORY_LABELS, QUESTION_STATUS_LABELS, QuestionStatus } from '../questions/question.model';

type RowAction = 'view' | 'edit' | 'remove';

@Component({
  selector: 'app-admin-questions',
  imports: [FormsModule, RouterLink, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatProgressBarModule, FilterPanel, ListHeader, OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-filter-panel [summary]="filterSummary()">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Pretraga (pitanje, odgovor)</mat-label>
        <input matInput [ngModel]="search()" (ngModelChange)="search.set($event)" />
      </mat-form-field>
      <div class="chip-row" role="group" aria-label="Status">
        <button type="button" [matButton]="!status() ? 'filled' : 'outlined'" [theme]="!status() ? 'primary' : 'tertiary'" size="sm" [attr.aria-pressed]="!status()" (click)="status.set(null)">Sva</button>
        @for (option of statuses; track option) {
          <button type="button" [matButton]="status() === option ? 'filled' : 'outlined'" [theme]="status() === option ? 'primary' : 'tertiary'" size="sm" [attr.aria-pressed]="status() === option" (click)="status.set(option)">
            {{ statusLabels[option] }}{{ option === 'pending' && pending() ? ' (' + pending() + ')' : '' }}
          </button>
        }
      </div>
    </app-filter-panel>
    <app-list-header [count]="items().length">
      <a mat-flat-button routerLink="novo">Novo pitanje i odgovor</a>
    </app-list-header>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <div class="admin-rows">
      @for (item of items(); track item.id) {
        <div class="admin-row admin-row-compact">
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
          <app-options-menu [options]="menuFor(item)" [label]="'Opcije za: ' + item.title" (selected)="onAction(item, $event)" />
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
  protected readonly filterSummary = computed(() => {
    const status = this.status();
    const label = status ? this.statusLabels[status] : '';
    const parts = [label.charAt(0).toUpperCase() + label.slice(1), this.search().trim() ? `„${this.search().trim()}”` : ''];
    return parts.filter(Boolean).join(' · ') || 'Sva pitanja';
  });

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

  protected menuFor(item: AdminQuestion): MenuOption<RowAction>[] {
    const options: MenuOption<RowAction>[] = [];
    if (item.status === 'published' && item.slug) {
      options.push({ value: 'view', label: 'Pogledaj', icon: 'eye', link: ['/pitanja', item.slug], newTab: true });
    }
    options.push({ value: 'edit', label: item.status === 'pending' ? 'Odgovori' : 'Izmeni', icon: 'edit', link: ['/admin/pitanja', item.id] });
    if (this.auth.isAdmin()) {
      options.push({ value: 'remove', label: 'Obriši', icon: 'trash', danger: true, dividerBefore: true });
    }
    return options;
  }

  protected onAction(item: AdminQuestion, action: RowAction): void {
    if (action === 'remove') {
      this.remove(item);
    }
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
