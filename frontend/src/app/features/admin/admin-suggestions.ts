import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { formatDate } from '../../core/content/content.model';
import { FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { queryFilters } from '../../shared/list-filters/query-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { Pagination } from '../../shared/pagination/pagination';
import { NewsSuggestion, SUGGESTION_ORIGIN_LABELS, SUGGESTION_STATUS_LABELS, SuggestionPage, SuggestionStatus } from './sources.model';

type SuggestionAction = 'open' | 'dismiss' | 'restore' | 'news';

@Component({
  selector: 'app-admin-suggestions',
  imports: [RouterLink, MatProgressBarModule, BUTTON_IMPORTS, ListFilters, ListHeader, OptionsMenu, Pagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .suggestion-excerpt {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      overflow-wrap: anywhere;
    }

    .suggestion-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `,
  template: `
    <p class="muted small mb-3">
      Nove objave sa sajtova i YouTube kanala organizacija stižu jednom dnevno, a udruženja bez naloga ih šalju preko forme
      <a class="inline-link" routerLink="/udruzenja/posalji-objavu">Pošalji objavu</a>. Od važnih napravite kratku vest svojim rečima, sa linkom na izvor.
      Izvore podešavate na stranici <a class="inline-link" routerLink="/admin/izvori">Izvori organizacija</a>.
    </p>
    <app-list-filters [fields]="fields()" [values]="filters.values()" emptySummary="Čekaju pregled" (filterChange)="change($event)" (clearAll)="filters.clear()" />
    <app-list-header [count]="meta()?.total ?? null" [page]="page()" [lastPage]="meta()?.last_page ?? null" />
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <div class="admin-rows">
      @for (item of items(); track item.id) {
        <div class="admin-row">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              <span class="state-chip state-muted">{{ originLabels[item.origin] }}</span>
              @if (item.organization; as organization) {
                <span>{{ organization.name }}</span>
              } @else if (item.sender?.organization; as senderOrganization) {
                <span>{{ senderOrganization }}</span>
              }
              <span>· {{ date(item.published_on ?? item.created_at) }}</span>
              @if (item.host) {
                <span>· {{ item.host }}</span>
              }
            </span>
            @if (item.url) {
              <a class="post-title" [href]="item.url" target="_blank" rel="noopener">{{ item.title }}</a>
            } @else {
              <strong class="post-title">{{ item.title }}</strong>
            }
            @if (item.excerpt) {
              <span class="small muted suggestion-excerpt">{{ item.excerpt }}</span>
            }
            @if (item.sender; as sender) {
              <span class="small">Poslao/la: {{ sender.name }} · <a class="inline-link" [href]="'mailto:' + sender.email">{{ sender.email }}</a></span>
            }
            @if (item.status !== 'new' && item.reviewer) {
              <span class="small muted">{{ statusLabels[item.status] }}: {{ item.reviewer }}, {{ date(item.reviewed_at) }}</span>
            }
          </div>
          <div class="suggestion-actions">
            @if (item.status === 'new') {
              <button type="button" mat-flat-button size="sm" [disabled]="busy() === item.id" (click)="accept(item)">Napravi vest</button>
            } @else if (item.news; as news) {
              <a mat-stroked-button theme="tertiary" size="sm" [routerLink]="['/admin/vesti', news.id]">Otvori vest</a>
            }
            <app-options-menu [options]="menuFor(item)" [label]="'Opcije za: ' + item.title" (selected)="onAction(item, $event)" />
          </div>
        </div>
      } @empty {
        @if (!resource.isLoading()) {
          <p class="muted">{{ status() === 'new' ? 'Nema novih predloga. Proverite ponovo sutra.' : 'Nema predloga za ovaj izbor.' }}</p>
        }
      }
    </div>
    @if (meta(); as info) {
      <app-pagination [(page)]="page" [lastPage]="info.last_page" />
    }
  `,
})
export class AdminSuggestions {
  readonly #http = inject(HttpClient);
  readonly #router = inject(Router);
  readonly #notifications = inject(NotificationService);

  protected readonly originLabels = SUGGESTION_ORIGIN_LABELS;
  protected readonly statusLabels = SUGGESTION_STATUS_LABELS;
  protected readonly filters = queryFilters(['status', 'izvor', 'pretraga']);
  protected readonly page = signal(1);
  protected readonly busy = signal<number | null>(null);
  protected readonly status = computed(() => (this.filters.values()['status'] || 'new') as SuggestionStatus);

  protected readonly resource = httpResource<SuggestionPage>(() => {
    const { izvor, pretraga } = this.filters.values();
    return {
      url: `${API_URL}/admin/news-suggestions/list`,
      method: 'POST',
      body: { status: this.status(), origin: izvor || null, search: pretraga || null, page: this.page() },
    };
  });
  readonly #last = linkedSignal<SuggestionPage | undefined, SuggestionPage | null>({
    source: () => (this.resource.hasValue() ? this.resource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });
  protected readonly items = computed(() => this.#last()?.data ?? []);
  protected readonly meta = computed(() => this.#last()?.meta ?? null);
  protected readonly fields = computed<FilterField[]>(() => {
    const counts = this.#last()?.counts ?? {};
    return [
      {
        key: 'status',
        label: 'Stanje',
        allLabel: `${SUGGESTION_STATUS_LABELS.new} (${counts.new ?? 0})`,
        options: (['accepted', 'dismissed'] as const).map((value) => ({ value, label: `${SUGGESTION_STATUS_LABELS[value]} (${counts[value] ?? 0})` })),
      },
      { key: 'izvor', label: 'Odakle', allLabel: 'Sve', options: Object.entries(SUGGESTION_ORIGIN_LABELS).map(([value, label]) => ({ value, label })) },
      { key: 'pretraga', label: 'Pretraga (naslov, opis)', type: 'search' },
    ];
  });

  protected date(value: string | null): string {
    return formatDate(value);
  }

  protected change(change: { key: string; value: string }): void {
    this.page.set(1);
    this.filters.set(change);
  }

  protected accept(item: NewsSuggestion): void {
    this.busy.set(item.id);
    this.#http.post<{ news_id: number }>(`${API_URL}/admin/news-suggestions/${item.id}/accept`, {}).subscribe({
      next: ({ news_id }) => {
        this.busy.set(null);
        this.#notifications.show('Nacrt vesti je napravljen. Napišite sažetak svojim rečima i objavite.');
        this.#router.navigate(['/admin/vesti', news_id]);
      },
      error: (error) => {
        this.busy.set(null);
        this.#notifications.show(apiErrorMessage(error));
      },
    });
  }

  protected menuFor(item: NewsSuggestion): MenuOption<SuggestionAction>[] {
    const options: MenuOption<SuggestionAction>[] = [];
    if (item.url) {
      options.push({ value: 'open', label: 'Otvori izvor', icon: 'external', href: item.url });
    }
    if (item.status === 'new') {
      options.push({ value: 'dismiss', label: 'Odbaci', icon: 'x-circle', dividerBefore: !!options.length });
    } else if (!item.news) {
      options.push({ value: 'restore', label: 'Vrati u red', icon: 'arrow-left' });
    }
    return options;
  }

  protected onAction(item: NewsSuggestion, action: SuggestionAction): void {
    if (action === 'dismiss' || action === 'restore') {
      const status = action === 'dismiss' ? 'dismissed' : 'new';
      this.#http.patch<NewsSuggestion>(`${API_URL}/admin/news-suggestions/${item.id}`, { status }).subscribe({
        next: () => {
          this.#notifications.show(action === 'dismiss' ? 'Predlog je odbačen.' : 'Predlog je vraćen u red.');
          this.resource.reload();
        },
        error: (error) => this.#notifications.show(apiErrorMessage(error)),
      });
    }
  }
}
