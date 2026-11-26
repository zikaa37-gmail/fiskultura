import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { API_URL } from '../../core/http/api';
import { ArticleCard } from '../../shared/article-card/article-card';
import { ArticlePage } from './article.model';
import { WriteButton } from './write-button';

@Component({
  selector: 'app-articles-showcase',
  imports: [RouterLink, BUTTON_IMPORTS, ArticleCard, WriteButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'articles-showcase', '[class.articles-showcase-compact]': 'compact()' },
  template: `
    <div class="articles-showcase-head">
      <p class="eyebrow">Kolumne i autorski tekstovi</p>
      @if (pageTitle()) {
        <h2>Priče kolega</h2>
      } @else {
        <h3 class="articles-showcase-title">Priče kolega</h3>
      }
      <p class="muted">
        Kolege iz vojske, policije, Gorske službe spasavanja, ski centara i drugih mesta pišu o poslu van škole: šta se traži i kako su
        došli do njega.
      </p>
    </div>

    @if (articles().length) {
      <div class="article-grid mb-4">
        @for (item of articles(); track item.id) {
          <app-article-card [article]="item" />
        }
      </div>
    } @else if (loaded()) {
      <p class="articles-showcase-empty mb-4">Prve priče su u pripremi. Radiš van škole ili imaš specijalizaciju koju malo ko zna? Prijavi se za autora.</p>
    }

    <div class="articles-showcase-actions">
      @if (articles().length) {
        <a mat-flat-button routerLink="/tekstovi">Svi tekstovi</a>
      }
      <app-write-button />
    </div>
  `,
})
export class ArticlesShowcase {
  readonly limit = input(4);
  readonly pageTitle = input(true);
  readonly compact = input(false);

  readonly #resource = httpResource<ArticlePage>(() => ({ url: `${API_URL}/articles/list`, method: 'POST', body: { per_page: this.limit() } }));
  protected readonly articles = computed(() => (this.#resource.hasValue() ? this.#resource.value().data : []));
  protected readonly loaded = computed(() => this.#resource.hasValue());
}
