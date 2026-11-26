import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { AuthService } from '../../core/auth/auth.service';
import { API_URL } from '../../core/http/api';
import { ArticleCard } from '../../shared/article-card/article-card';
import { FilterChange, FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { queryFilters } from '../../shared/list-filters/query-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { Pagination } from '../../shared/pagination/pagination';
import { ARTICLE_KIND_LABELS, ArticleKind, ArticlePage, Topic } from './article.model';

@Component({
  selector: 'app-articles',
  imports: [RouterLink, BUTTON_IMPORTS, MatProgressBarModule, ArticleCard, ListFilters, ListHeader, Pagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Kolumne i autorski tekstovi</p>
          <h1>Priče kolega</h1>
          <p class="muted">
            Većina nas posao vidi samo u školi. Ovde kolege iz vojske, policije, Gorske službe spasavanja, ski centara, borilačkih klubova i
            drugih mesta pišu šta rade, koje specijalizacije i uslovi se traže i kako se dolazi do stalnog ili sezonskog posla.
          </p>
          <a class="news-subscribe" routerLink="/vesti">← Vesti i objave</a>
        </div>

        <app-list-filters [fields]="fields()" [values]="filters.values()" emptySummary="Svi tekstovi" (filterChange)="setFilter($event)" (clearAll)="filters.clear()" />
        @if (resource.isLoading()) {
          <mat-progress-bar mode="indeterminate" />
        }
        @if (resource.error()) {
          <div class="empty-state">
            <h3>Tekstovi trenutno nisu dostupni</h3>
            <p class="muted">Pokušaj ponovo za nekoliko minuta.</p>
          </div>
        } @else if (meta(); as info) {
          <app-list-header label="Pronađeno tekstova" [count]="info.total" [page]="info.page" [lastPage]="info.last_page">
            @if (auth.isStaff()) {
              <a mat-flat-button routerLink="/admin/tekstovi/novi">Napiši tekst</a>
            }
          </app-list-header>
          <div class="article-grid">
            @for (item of items(); track item.id) {
              <app-article-card [article]="item" />
            } @empty {
              <div class="empty-state">
                <h3>Nema tekstova za izabrane filtere</h3>
                <p class="muted">Radiš van škole ili imaš specijalizaciju o kojoj se malo zna? <a class="inline-link" routerLink="/kontakt">Piši nam.</a></p>
              </div>
            }
          </div>
          @if (info.last_page > 1) {
            <app-pagination [page]="info.page" [lastPage]="info.last_page" previousLabel="Noviji tekstovi" nextLabel="Stariji tekstovi" (pageChange)="goToPage($event)" />
          }
        }
      </div>
    </section>
  `,
})
export class Articles {
  protected readonly auth = inject(AuthService);
  readonly #router = inject(Router);
  readonly #query = toSignal(inject(ActivatedRoute).queryParamMap);

  protected readonly filters = queryFilters(['vrsta', 'tema', 'pretraga']);
  readonly #page = computed(() => Math.max(1, Number(this.#query()?.get('strana')) || 1));

  readonly #topics = httpResource<Topic[]>(() => `${API_URL}/topics`);
  protected readonly fields = computed<FilterField[]>(() => [
    { key: 'vrsta', label: 'Vrsta', allLabel: 'Sve', options: (Object.keys(ARTICLE_KIND_LABELS) as ArticleKind[]).map((value) => ({ value, label: ARTICLE_KIND_LABELS[value] })) },
    { key: 'tema', label: 'Tema', allLabel: 'Sve teme', options: (this.#topics.hasValue() ? this.#topics.value() : []).map((topic) => ({ value: topic.slug, label: topic.name })) },
    { key: 'pretraga', label: 'Pretraga', type: 'search' },
  ]);

  protected readonly resource = httpResource<ArticlePage>(() => {
    const { vrsta, tema, pretraga } = this.filters.values();
    return {
      url: `${API_URL}/articles/list`,
      method: 'POST',
      body: { kind: vrsta || null, topic: tema || null, search: pretraga || null, page: this.#page(), per_page: 12 },
    };
  });
  readonly #last = linkedSignal<ArticlePage | undefined, ArticlePage | null>({
    source: () => (this.resource.hasValue() ? this.resource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });
  protected readonly meta = computed(() => this.#last()?.meta ?? null);
  protected readonly items = computed(() => this.#last()?.data ?? []);

  protected setFilter(change: FilterChange): void {
    this.#router.navigate([], { queryParams: { [change.key]: change.value || null, strana: null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected goToPage(page: number): void {
    this.#router.navigate([], { queryParams: { strana: page > 1 ? page : null }, queryParamsHandling: 'merge' });
  }
}
