import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { AuthService } from '../../core/auth/auth.service';
import { formatDate } from '../../core/content/content.model';
import { DeleteService } from '../../core/delete.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { FilterChange, FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { Pagination } from '../../shared/pagination/pagination';
import { AdminArticle, AdminArticlePage, ARTICLE_KIND_LABELS, ARTICLE_STATUS_LABELS, ArticleKind, articleState } from '../articles/article.model';
import { Icon } from '../../shared/icon/icon';
import { ArticleTopicStore } from '../articles/article-topic-store';

type RowAction = 'view' | 'edit' | 'feature' | 'remove';

const QUERY_KEYS = ['status', 'vrsta', 'tema', 'pretraga'] as const;

@Component({
  selector: 'app-admin-articles',
  imports: [RouterLink, BUTTON_IMPORTS, MatProgressBarModule, ListFilters, ListHeader, OptionsMenu, Pagination, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-list-filters [fields]="fields()" [values]="filters()" emptySummary="Svi tekstovi" (filterChange)="setFilter($event)" (clearAll)="clearFilters()" />
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <app-list-header [count]="page()?.meta?.total ?? null" [page]="page()?.meta?.page ?? null" [lastPage]="page()?.meta?.last_page ?? null">
      <a mat-flat-button routerLink="nova-prica"><app-icon name="plus" [size]="18" /> Nova priča</a>
    </app-list-header>
    @if (resource.error()) {
      <p class="form-error" role="alert">Spisak priča trenutno nije dostupan. Pokušaj ponovo za nekoliko minuta.</p>
    }
    @if (page(); as data) {
      <div class="admin-rows">
        @for (item of data.data; track item.id) {
          @let state = stateOf(item);
          <div class="admin-row admin-row-compact">
            <div class="admin-row-main">
              <span class="admin-row-meta">
                <span class="state-chip" [class]="'state-' + state.tone">{{ state.label }}</span>
                <span class="state-chip state-muted">{{ kindLabels[item.kind] }}</span>
                @if (item.topic) {
                  <span>{{ item.topic.name }}</span>
                } @else if (item.topic_proposal) {
                  <span class="state-chip state-warn">Nova tema: {{ item.topic_proposal }}</span>
                }
                @if (auth.isEditor()) {
                  <span>{{ item.author.name }}</span>
                }
                @if (item.updated_at) {
                  <span>izmenjeno {{ date(item.updated_at) }}</span>
                }
              </span>
              <a class="post-title" [routerLink]="[item.id]">{{ item.title }}</a>
            </div>
            <app-options-menu [options]="menuFor(item)" [label]="'Opcije za: ' + item.title" (selected)="onAction(item, $event)" />
          </div>
        } @empty {
          <div class="empty-state">
            <h3>{{ auth.isEditor() ? 'Nema tekstova za ovaj izbor' : 'Još nemaš tekstova' }}</h3>
            <p class="muted">Tekst se piše u Wordu ili bilo gde drugde, pa se nalepi u formu. Urednik ga pregleda pre objave.</p>
            <a mat-flat-button routerLink="nova-prica"><app-icon name="plus" [size]="18" /> Nova priča</a>
          </div>
        }
      </div>
      @if (data.meta.last_page > 1) {
        <app-pagination [page]="data.meta.page" [lastPage]="data.meta.last_page" (pageChange)="goToPage($event)" />
      }
    }
  `,
})
export class AdminArticles {
  protected readonly auth = inject(AuthService);
  readonly #http = inject(HttpClient);
  readonly #router = inject(Router);
  readonly #notifications = inject(NotificationService);
  readonly #delete = inject(DeleteService);
  readonly #query = toSignal(inject(ActivatedRoute).queryParamMap);

  protected readonly kindLabels = ARTICLE_KIND_LABELS;
  protected readonly stateOf = articleState;

  protected readonly filters = computed(() => Object.fromEntries(QUERY_KEYS.map((key) => [key, this.#query()?.get(key) ?? ''])) as Record<string, string>);
  readonly #page = computed(() => Math.max(1, Number(this.#query()?.get('strana')) || 1));
  readonly #topics = inject(ArticleTopicStore).load().topics;

  protected readonly resource = httpResource<AdminArticlePage>(() => {
    const { status, vrsta, tema, pretraga } = this.filters();
    return {
      url: `${API_URL}/admin/articles/list`,
      method: 'POST',
      body: { status: status || null, kind: vrsta || null, topic_id: tema ? Number(tema) : null, search: pretraga || null, page: this.#page() },
    };
  });
  protected readonly page = linkedSignal<AdminArticlePage | undefined, AdminArticlePage | null>({
    source: () => (this.resource.hasValue() ? this.resource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });

  protected readonly fields = computed<FilterField[]>(() => {
    const submitted = this.page()?.submitted ?? 0;
    return [
      {
        key: 'status',
        label: 'Status',
        allLabel: 'Svi',
        options: Object.entries(ARTICLE_STATUS_LABELS).map(([value, label]) => ({ value, label: value === 'submitted' && submitted ? `${label} (${submitted})` : label })),
      },
      { key: 'vrsta', label: 'Vrsta', allLabel: 'Sve', options: (Object.keys(ARTICLE_KIND_LABELS) as ArticleKind[]).map((value) => ({ value, label: ARTICLE_KIND_LABELS[value] })) },
      { key: 'tema', label: 'Tema', allLabel: 'Sve teme', options: this.#topics().map((topic) => ({ value: `${topic.id}`, label: topic.name })) },
      { key: 'pretraga', label: 'Pretraga', type: 'search' },
    ];
  });

  protected date(value: string): string {
    return formatDate(value);
  }

  protected setFilter(change: FilterChange): void {
    this.#router.navigate([], { queryParams: { [change.key]: change.value || null, strana: null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected clearFilters(): void {
    this.#router.navigate([], { queryParams: {} });
  }

  protected goToPage(page: number): void {
    this.#router.navigate([], { queryParams: { strana: page > 1 ? page : null }, queryParamsHandling: 'merge' });
  }

  protected menuFor(item: AdminArticle): MenuOption<RowAction>[] {
    const editor = this.auth.isEditor();
    const options: MenuOption<RowAction>[] = [];
    if (item.is_visible) {
      options.push({ value: 'view', label: 'Pogledaj', icon: 'eye', link: ['/tekstovi', item.slug], newTab: true });
    }
    options.push({ value: 'edit', label: item.can_edit ? 'Izmeni' : 'Otvori', icon: 'edit', link: ['/admin/tekstovi', item.id] });
    if (editor && item.is_visible) {
      options.push({ value: 'feature', label: item.featured ? 'Ukloni isticanje' : 'Istakni', icon: 'star' });
    }
    if (editor || item.status !== 'published') {
      options.push({ value: 'remove', label: 'Obriši', icon: 'trash', danger: true, dividerBefore: true });
    }
    return options;
  }

  protected onAction(item: AdminArticle, action: RowAction): void {
    if (action === 'feature') {
      this.#http.patch<AdminArticle>(`${API_URL}/admin/articles/${item.id}/featured`, { featured: !item.featured }).subscribe({
        next: (saved) => {
          this.#notifications.show(saved.featured ? 'Tekst je istaknut.' : 'Tekst više nije istaknut.');
          this.resource.reload();
        },
        error: (error) => this.#notifications.show(apiErrorMessage(error)),
      });
    } else if (action === 'remove') {
      this.#delete.confirmDelete(
        { title: 'Brisanje teksta', message: `Obrisati „${item.title}“? Ovo ne može da se vrati.`, url: `${API_URL}/admin/articles/${item.id}`, success: 'Tekst je obrisan.' },
        () => this.resource.reload(),
      );
    }
  }
}
