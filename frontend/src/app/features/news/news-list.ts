import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { NEWS_CATEGORY_LABELS, NewsCategory, NewsItem, NewsPage, Organization, organizationLabel } from '../../core/content/content.model';
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';
import { FilterChange, FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { NewsCard, NewsCardState } from '../../shared/news-card/news-card';
import { MenuOption } from '../../shared/options-menu/options-menu';
import { Pagination } from '../../shared/pagination/pagination';
import { ScrollArea } from '../../shared/scroll-area/scroll-area';
import { AdminNews, newsState, Page } from '../admin/admin.model';

const UMBRELLA_FILTER = 'sspfvs-mreza';
const STATUS_LABELS: Record<string, string> = { draft: 'Nacrti', published: 'Objavljeno', scheduled: 'Zakazano' };
const QUERY_KEYS = ['status', 'kategorija', 'udruzenje', 'godina', 'pretraga'] as const;

type NewsAction = 'view' | 'feature' | 'edit' | 'remove';

interface NewsRow {
  news: NewsItem;
  admin: AdminNews | null;
  state: NewsCardState | null;
}

@Component({
  selector: 'app-news-list',
  imports: [RouterLink, BUTTON_IMPORTS, MatProgressBarModule, ListFilters, ListHeader, NewsCard, Pagination, ScrollArea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-list-filters [fields]="fields()" [values]="filters()" [emptySummary]="admin() ? 'Sve vesti' : 'Sve objave'" (filterChange)="setFilter($event)" (clearAll)="clearFilters()" />

    @if (isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    @if (hasError()) {
      <div class="empty-state">
        <h3>Objave trenutno nisu dostupne</h3>
        <p class="muted">Pokušaj ponovo za nekoliko minuta.</p>
      </div>
    } @else if (meta(); as info) {
      <app-list-header [label]="admin() ? 'Ukupno' : 'Pronađeno objava'" [count]="info.total">
        @if (admin()) {
          <a mat-flat-button routerLink="/admin/vesti/nova">Nova vest</a>
        }
      </app-list-header>
      <app-scroll-area [label]="admin() ? 'Vesti' : 'Objave'" [fill]="true" [resetOn]="[info.page, filters()]">
        <div class="post-list">
          @for (row of rows(); track row.news.id) {
            <app-news-card
              [news]="row.news"
              [state]="row.state"
              [menu]="row.admin ? menuFor(row.admin) : null"
              [editLink]="row.admin ? ['/admin/vesti', row.admin.id] : null"
              (changed)="reload()"
              (menuSelected)="row.admin && onAction(row.admin, $event)"
            />
          } @empty {
            <div class="empty-state">
              <h3>Nema objava za izabrane filtere</h3>
              <button type="button" mat-stroked-button (click)="clearFilters()">Poništi filtere</button>
            </div>
          }
        </div>
      </app-scroll-area>
      <app-pagination
        [page]="info.page"
        [lastPage]="info.last_page"
        [previousLabel]="admin() ? 'Prethodna strana' : 'Novije objave'"
        [nextLabel]="admin() ? 'Sledeća strana' : 'Starije objave'"
        (pageChange)="goToPage($event)"
      />
    }
  `,
})
export class NewsList {
  readonly admin = input(false);

  readonly #http = inject(HttpClient);
  readonly #router = inject(Router);
  readonly #notifications = inject(NotificationService);
  readonly #confirm = inject(ConfirmService);
  readonly #query = toSignal(inject(ActivatedRoute).queryParamMap);

  protected readonly filters = computed(() => {
    const query = this.#query();
    const values: Record<string, string> = {};
    for (const key of QUERY_KEYS) {
      values[key] = query?.get(key) ?? '';
    }
    if (!this.admin()) {
      values['status'] = '';
    }
    return values;
  });
  readonly #page = computed(() => Math.max(1, Number(this.#query()?.get('strana')) || 1));

  readonly #organizationsResource = httpResource<Organization[]>(() => `${API_URL}/organizations`);
  readonly #yearsResource = httpResource<number[]>(() => `${API_URL}/news/years`);

  protected readonly fields = computed<FilterField[]>(() => {
    const organizations = (this.#organizationsResource.hasValue() ? this.#organizationsResource.value() : [])
      .filter((organization) => (organization.news_count ?? 0) > 0)
      .sort((a, b) => organizationLabel(a).localeCompare(organizationLabel(b), 'sr'));
    const years = this.#yearsResource.hasValue() ? this.#yearsResource.value() : [];
    const fields: FilterField[] = [
      { key: 'kategorija', label: 'Kategorija', options: (Object.keys(NEWS_CATEGORY_LABELS) as NewsCategory[]).map((value) => ({ value, label: NEWS_CATEGORY_LABELS[value] })) },
      {
        key: 'udruzenje',
        label: 'Izvor',
        allLabel: 'Svi izvori',
        options: [{ value: UMBRELLA_FILTER, label: 'SSPFVS i članice' }, ...organizations.map((item) => ({ value: item.slug, label: organizationLabel(item) }))],
      },
      { key: 'godina', label: 'Godina', allLabel: 'Sve godine', options: years.map((year) => ({ value: `${year}`, label: `${year}` })) },
      { key: 'pretraga', label: 'Pretraga', type: 'search' },
    ];
    return this.admin()
      ? [{ key: 'status', label: 'Status', allLabel: 'Svi', options: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })) }, ...fields]
      : fields;
  });

  readonly #resource = httpResource<NewsPage | Page<AdminNews>>(() => {
    const filters = this.filters();
    const organization = filters['udruzenje'];
    return {
      url: this.admin() ? `${API_URL}/admin/news/list` : `${API_URL}/news/list`,
      method: 'POST',
      body: {
        status: filters['status'] || null,
        category: filters['kategorija'] || null,
        organization: organization && organization !== UMBRELLA_FILTER ? organization : null,
        umbrella: organization === UMBRELLA_FILTER ? 'sspfvs' : null,
        year: filters['godina'] ? Number(filters['godina']) : null,
        search: filters['pretraga'] || null,
        page: this.#page(),
        per_page: this.admin() ? 25 : 12,
      },
    };
  });

  protected readonly isLoading = this.#resource.isLoading;
  protected readonly hasError = computed(() => !!this.#resource.error());
  readonly #lastPage = linkedSignal<NewsPage | Page<AdminNews> | undefined, NewsPage | Page<AdminNews> | null>({
    source: () => (this.#resource.hasValue() ? this.#resource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });
  protected readonly meta = computed(() => this.#lastPage()?.meta ?? null);
  protected readonly rows = computed<NewsRow[]>(() => {
    const data = this.#lastPage()?.data ?? [];
    if (!this.admin()) {
      return (data as NewsItem[]).map((news) => ({ news, admin: null, state: null }));
    }
    return (data as AdminNews[]).map((item) => ({ news: toNewsItem(item), admin: item, state: newsState(item) }));
  });

  protected setFilter(change: FilterChange): void {
    this.#navigate({ [change.key]: change.value || null, strana: null });
  }

  protected goToPage(page: number): void {
    this.#navigate({ strana: page > 1 ? page : null });
  }

  protected clearFilters(): void {
    this.#router.navigate([], { queryParams: {} });
  }

  protected reload(): void {
    this.#resource.reload();
  }

  protected menuFor(item: AdminNews): MenuOption<NewsAction>[] {
    return [
      ...(item.is_visible ? [{ value: 'view' as const, label: 'Pogledaj', icon: 'eye' as const, link: ['/vesti', item.slug], newTab: true }] : []),
      { value: 'feature', label: item.featured ? 'Ukloni isticanje' : 'Istakni', icon: 'star' },
      { value: 'edit', label: 'Izmeni', icon: 'edit', link: ['/admin/vesti', item.id] },
      { value: 'remove', label: 'Obriši', icon: 'trash', danger: true },
    ];
  }

  protected onAction(item: AdminNews, action: string): void {
    if (action === 'feature') {
      this.#toggleFeatured(item);
    } else if (action === 'remove') {
      this.#remove(item);
    }
  }

  #toggleFeatured(item: AdminNews): void {
    this.#http.patch<AdminNews>(`${API_URL}/admin/news/${item.id}/featured`, { featured: !item.featured }).subscribe({
      next: (saved) => {
        this.#notifications.show(saved.featured ? 'Vest je istaknuta.' : 'Vest više nije istaknuta.');
        this.reload();
      },
      error: (error) => this.#notifications.show(apiErrorMessage(error)),
    });
  }

  #remove(item: AdminNews): void {
    this.#confirm.confirm({ title: 'Brisanje vesti', message: `Obrisati „${item.title}“? Ovo ne može da se vrati.`, confirmLabel: 'Obriši' }).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.#http.delete(`${API_URL}/admin/news/${item.id}`).subscribe({
        next: () => {
          this.#notifications.show('Vest je obrisana.');
          this.reload();
        },
        error: (error) => this.#notifications.show(apiErrorMessage(error)),
      });
    });
  }

  #navigate(queryParams: Record<string, string | number | null>): void {
    this.#router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}

function toNewsItem(item: AdminNews): NewsItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    category: item.category,
    featured: item.featured,
    cover_image: null,
    published_at: item.published_at,
    source: { url: item.source_url, type: item.source_type, published_at: item.source_published_at },
    organization: item.organization,
  };
}
