import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { API_URL } from '../../core/http/api';
import { NEWS_CATEGORY_LABELS, NewsCategory, NewsPage, Organization, organizationLabel } from '../../core/content/content.model';
import { NewsCard } from '../../shared/news-card/news-card';

const PER_PAGE = 12;
const UMBRELLA_FILTER = 'sspfvs-mreza';

@Component({
  selector: 'app-news',
  imports: [FormsModule, RouterLink, MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatSelectModule, NewsCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news.html',
})
export class News {
  readonly kategorija = input<string>();
  readonly udruzenje = input<string>();
  readonly godina = input<string>();
  readonly pretraga = input<string>();
  readonly strana = input<string>();

  readonly #router = inject(Router);

  protected readonly umbrellaFilter = UMBRELLA_FILTER;
  protected readonly categoryLabels = NEWS_CATEGORY_LABELS;
  protected readonly categories = Object.keys(NEWS_CATEGORY_LABELS) as NewsCategory[];
  protected readonly label = organizationLabel;

  protected readonly category = computed(() => (this.categories.includes(this.kategorija() as NewsCategory) ? (this.kategorija() as NewsCategory) : 'all'));
  protected readonly organization = computed(() => this.udruzenje() ?? '');
  protected readonly year = computed(() => this.godina() ?? '');
  protected readonly page = computed(() => Math.max(1, Number(this.strana()) || 1));
  protected readonly searchText = linkedSignal(() => this.pretraga() ?? '');

  readonly #newsResource = httpResource<NewsPage>(() => {
    const organization = this.organization();
    return {
      url: `${API_URL}/news/list`,
      method: 'POST',
      body: {
        category: this.category() === 'all' ? null : this.category(),
        organization: organization && organization !== UMBRELLA_FILTER ? organization : null,
        umbrella: organization === UMBRELLA_FILTER ? 'sspfvs' : null,
        year: this.year() ? Number(this.year()) : null,
        search: this.pretraga() || null,
        page: this.page(),
        per_page: PER_PAGE,
      },
    };
  });
  readonly #organizationsResource = httpResource<Organization[]>(() => `${API_URL}/organizations`);
  readonly #yearsResource = httpResource<number[]>(() => `${API_URL}/news/years`);

  protected readonly isLoading = this.#newsResource.isLoading;
  protected readonly hasError = computed(() => !!this.#newsResource.error());
  readonly #lastPage = linkedSignal<NewsPage | undefined, NewsPage | null>({
    source: () => (this.#newsResource.hasValue() ? this.#newsResource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });
  protected readonly items = computed(() => this.#lastPage()?.data ?? []);
  protected readonly meta = computed(() => this.#lastPage()?.meta ?? null);
  protected readonly years = computed(() => (this.#yearsResource.hasValue() ? this.#yearsResource.value() : []));
  protected readonly organizations = computed(() =>
    (this.#organizationsResource.hasValue() ? this.#organizationsResource.value() : [])
      .filter((organization) => (organization.news_count ?? 0) > 0)
      .sort((a, b) => this.label(a).localeCompare(this.label(b), 'sr')),
  );
  protected readonly hasFilters = computed(() => this.category() !== 'all' || !!this.organization() || !!this.year() || !!this.pretraga());

  protected setFilter(name: 'kategorija' | 'udruzenje' | 'godina', value: string | null): void {
    this.#navigate({ [name]: value && value !== 'all' ? value : null, strana: null });
  }

  protected search(): void {
    this.#navigate({ pretraga: this.searchText().trim() || null, strana: null });
  }

  protected goToPage(page: number): void {
    this.#navigate({ strana: page > 1 ? page : null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected clearFilters(): void {
    this.searchText.set('');
    this.#router.navigate([], { queryParams: {} });
  }

  #navigate(queryParams: Record<string, string | number | null>): void {
    this.#router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}
