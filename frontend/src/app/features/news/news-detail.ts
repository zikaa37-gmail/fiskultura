import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { API_URL } from '../../core/http/api';
import { formatDate, NEWS_CATEGORY_LABELS, NewsDetail as NewsDetailModel, SOURCE_TYPE_LABELS } from '../../core/content/content.model';
import { NewsCard } from '../../shared/news-card/news-card';

@Component({
  selector: 'app-news-detail',
  imports: [RouterLink, MatButtonModule, MatProgressBarModule, NewsCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container article">
        <a class="inline-link small" routerLink="/vesti">← Sve vesti</a>
        @if (resource.isLoading()) {
          <mat-progress-bar mode="indeterminate" />
        } @else if (resource.error()) {
          <div class="empty-state">
            <h1>Vest nije pronađena</h1>
            <p class="muted">Možda je uklonjena ili je link pogrešan.</p>
            <a mat-flat-button routerLink="/vesti">Sve vesti</a>
          </div>
        } @else if (news(); as item) {
          <article class="article-body">
            <span class="post-meta">
              @if (date()) {
                <span>{{ date() }}</span>
              }
              <span class="post-category">{{ categoryLabels[item.category] }}</span>
            </span>
            <h1>{{ item.title }}</h1>
            <p class="lead">{{ item.summary }}</p>
            @if (item.body) {
              <div class="article-text">{{ item.body }}</div>
            }
            <aside class="source-box">
              <strong>Izvor informacije</strong>
              @if (item.organization; as organization) {
                <span>
                  Organizacija:
                  <a class="inline-link" [routerLink]="['/udruzenja', organization.slug]">{{ organization.name }}</a>
                </span>
              }
              @if (item.source.url; as url) {
                <span>
                  Preuzeto sa: {{ item.source.type ? sourceLabels[item.source.type] : 'izvor' }} ·
                  <a class="inline-link" [href]="url" target="_blank" rel="noopener">pročitaj original →</a>
                </span>
              }
              <span class="muted small">Fiskultura prenosi kratak sažetak svojim rečima; ceo tekst je na izvoru.</span>
            </aside>
          </article>

          @if (item.related.length) {
            <div class="org-section related">
              <h2>Povezane objave</h2>
              <div class="post-list">
                @for (related of item.related; track related.id) {
                  <app-news-card [news]="related" />
                }
              </div>
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class NewsDetail {
  readonly slug = input.required<string>();

  readonly #title = inject(Title);
  readonly #meta = inject(Meta);

  protected readonly resource = httpResource<NewsDetailModel>(() => `${API_URL}/news/${encodeURIComponent(this.slug())}`);
  protected readonly news = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  protected readonly date = computed(() => formatDate(this.news()?.source.published_at ?? null));
  protected readonly categoryLabels = NEWS_CATEGORY_LABELS;
  protected readonly sourceLabels = SOURCE_TYPE_LABELS;

  constructor() {
    effect(() => {
      const item = this.news();
      if (item) {
        this.#title.setTitle(`${item.title} — Fiskultura`);
        this.#meta.updateTag({ name: 'description', content: item.summary });
        this.#meta.updateTag({ property: 'og:title', content: item.title });
        this.#meta.updateTag({ property: 'og:description', content: item.summary });
      }
    });
  }
}
