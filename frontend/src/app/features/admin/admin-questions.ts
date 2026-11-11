import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/auth/auth.service';
import { formatDate } from '../../core/content/content.model';
import { DeleteService } from '../../core/delete.service';
import { API_URL } from '../../core/http/api';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { matchesSearch, queryFilters } from '../../shared/list-filters/query-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { AdminQuestion, QUESTION_CATEGORY_LABELS, QUESTION_STATUS_LABELS, QuestionStatus } from '../questions/question.model';

type RowAction = 'view' | 'edit' | 'remove';

@Component({
  selector: 'app-admin-questions',
  imports: [RouterLink, BUTTON_IMPORTS, MatProgressBarModule, ListFilters, ListHeader, OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-list-filters [fields]="fields()" [values]="filters.values()" emptySummary="Sva pitanja" (filterChange)="filters.set($event)" (clearAll)="filters.clear()" />
    <app-list-header [count]="items().length">
      @if (auth.isEditor()) {
        <a mat-flat-button routerLink="novo">Novo pitanje i odgovor</a>
      }
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
              <span>dodeljeno: {{ item.assignee?.name ?? 'niko' }}</span>
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
  readonly #delete = inject(DeleteService);

  protected readonly categoryLabels = QUESTION_CATEGORY_LABELS;
  protected readonly statusLabels = QUESTION_STATUS_LABELS;
  protected readonly filters = queryFilters(['status', 'kategorija', 'dodeljeno', 'pretraga']);
  readonly #status = computed(() => {
    const status = this.filters.values()['status'];
    return status in QUESTION_STATUS_LABELS ? (status as QuestionStatus) : null;
  });

  protected readonly resource = httpResource<{ data: AdminQuestion[]; pending: number }>(() => ({
    url: `${API_URL}/admin/questions/list`,
    method: 'POST',
    body: { status: this.#status(), mine: this.filters.values()['dodeljeno'] === 'meni' },
  }));
  protected readonly pending = computed(() => (this.resource.hasValue() ? this.resource.value().pending : 0));
  protected readonly fields = computed<FilterField[]>(() => [
    {
      key: 'status',
      label: 'Status',
      allLabel: 'Sva',
      options: (Object.keys(QUESTION_STATUS_LABELS) as QuestionStatus[]).map((value) => ({
        value,
        label: capitalize(QUESTION_STATUS_LABELS[value]) + (value === 'pending' && this.pending() ? ` (${this.pending()})` : ''),
      })),
    },
    { key: 'kategorija', label: 'Oblast', allLabel: 'Sve oblasti', options: Object.entries(QUESTION_CATEGORY_LABELS).map(([value, label]) => ({ value, label })) },
    ...(this.auth.isEditor() ? [{ key: 'dodeljeno', label: 'Dodeljeno', allLabel: 'Svima', options: [{ value: 'meni', label: 'Meni' }] }] : []),
    { key: 'pretraga', label: 'Pretraga (pitanje, odgovor)', type: 'search' as const },
  ]);
  protected readonly items = computed(() => {
    const { kategorija, pretraga } = this.filters.values();
    const items = this.resource.hasValue() ? this.resource.value().data : [];
    return items.filter((item) => (!kategorija || item.category === kategorija) && matchesSearch(pretraga, [item.title, item.original, item.answer]));
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
      this.#delete.confirmDelete(
        { title: 'Brisanje pitanja', message: `Obrisati „${item.title}“?`, url: `${API_URL}/admin/questions/${item.id}`, success: 'Pitanje je obrisano.' },
        () => this.resource.reload(),
      );
    }
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
