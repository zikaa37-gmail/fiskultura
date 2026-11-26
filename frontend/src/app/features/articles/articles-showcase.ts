import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { AuthService } from '../../core/auth/auth.service';
import { API_URL } from '../../core/http/api';
import { ArticleCard } from '../../shared/article-card/article-card';
import { ArticlePage } from './article.model';

@Component({
  selector: 'app-articles-showcase',
  imports: [RouterLink, BUTTON_IMPORTS, ArticleCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'articles-showcase' },
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
      <p class="articles-showcase-empty mb-4">Prve priče su u pripremi. Radiš van škole ili imaš specijalizaciju koju malo ko zna? Piši nam.</p>
    }

    <div class="articles-showcase-actions">
      @if (articles().length) {
        <a mat-flat-button routerLink="/tekstovi">Svi tekstovi</a>
      }
      @if (auth.isStaff()) {
        <a mat-stroked-button routerLink="/admin/tekstovi/novi">Napiši tekst</a>
      } @else {
        <a mat-stroked-button routerLink="/kontakt">Želim da pišem</a>
      }
    </div>
  `,
})
export class ArticlesShowcase {
  readonly limit = input(4);
  readonly pageTitle = input(true);

  protected readonly auth = inject(AuthService);
  readonly #resource = httpResource<ArticlePage>(() => ({ url: `${API_URL}/articles/list`, method: 'POST', body: { per_page: this.limit() } }));
  protected readonly articles = computed(() => (this.#resource.hasValue() ? this.#resource.value().data : []));
  protected readonly loaded = computed(() => this.#resource.hasValue());
}
