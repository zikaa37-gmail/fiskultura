import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { formatDate } from '../../core/content/content.model';
import { API_URL, isNotFound } from '../../core/http/api';
import { breadcrumbs, DEFAULT_IMAGE, SeoService, SITE_ORGANIZATION, SITE_URL } from '../../core/seo/seo.service';
import { ArticleCard } from '../../shared/article-card/article-card';
import { AuthorByline } from '../../shared/author-byline/author-byline';
import { SimpleMarkdownPipe } from '../../shared/simple-markdown.pipe';
import { ARTICLE_KIND_LABELS, ArticleDetail as ArticleDetailModel } from './article.model';

@Component({
  selector: 'app-article-detail',
  imports: [RouterLink, BUTTON_IMPORTS, MatProgressBarModule, ArticleCard, AuthorByline, SimpleMarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container article">
        <a class="inline-link small" routerLink="/tekstovi">← Svi tekstovi</a>
        @if (resource.isLoading()) {
          <mat-progress-bar mode="indeterminate" />
        } @else if (resource.error()) {
          <div class="empty-state">
            <h1>Tekst nije pronađen</h1>
            <p class="muted">Možda je uklonjen ili je link pogrešan.</p>
            <a mat-flat-button routerLink="/tekstovi">Svi tekstovi</a>
          </div>
        } @else if (article(); as item) {
          <article class="article-body">
            <span class="article-card-labels">
              <span class="kind-label" [class.accent-violet]="item.kind === 'kolumna'" [class.accent-sky]="item.kind === 'clanak'">{{ kindLabels[item.kind] }}</span>
              @if (item.topic; as topic) {
                <a class="topic-label" routerLink="/tekstovi" [queryParams]="{ tema: topic.slug }">{{ topic.name }}</a>
              }
            </span>
            <h1>{{ item.title }}</h1>
            <app-author-byline [author]="item.author" [date]="date()" [large]="true" />
            <p class="lead">{{ item.summary }}</p>
            <div class="article-prose" [innerHTML]="item.body | simpleMarkdown"></div>

            @if (item.debate; as debate) {
              <aside class="source-box">
                <strong>Razgovaraj sa kolegama</strong>
                <span>Tekst je deo stručne debate <a class="inline-link" [routerLink]="['/debate', debate.slug]">„{{ debate.title }}”</a>.</span>
              </aside>
            }

            <aside class="author-box">
              <strong>O autoru</strong>
              <app-author-byline [author]="item.author" />
              @if (item.author.bio) {
                <p class="small">{{ item.author.bio }}</p>
              }
              @if (item.kind === 'kolumna') {
                <span class="small muted">Stavovi autora ne moraju da odražavaju stavove portala.</span>
              }
            </aside>
          </article>

          @if (item.related.length) {
            <div class="org-section related">
              <h2>Još tekstova</h2>
              <div class="article-grid">
                @for (related of item.related; track related.id) {
                  <app-article-card [article]="related" />
                }
              </div>
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class ArticleDetail {
  readonly slug = input.required<string>();

  readonly #seo = inject(SeoService);

  protected readonly kindLabels = ARTICLE_KIND_LABELS;
  protected readonly resource = httpResource<ArticleDetailModel>(() => `${API_URL}/articles/${encodeURIComponent(this.slug())}`);
  protected readonly article = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  protected readonly date = computed(() => formatDate(this.article()?.published_at ?? null));

  constructor() {
    effect(() => {
      const item = this.article();
      const path = `/tekstovi/${this.slug()}`;
      if (isNotFound(this.resource.error())) {
        this.#seo.set({ title: 'Tekst nije pronađen', path, noindex: true });
        return;
      }
      if (!item) {
        return;
      }
      const url = SITE_URL + path;
      this.#seo.set({
        title: item.title,
        description: item.summary,
        path,
        type: 'article',
        publishedTime: item.published_at,
        jsonLd: [
          {
            '@type': item.kind === 'kolumna' ? 'OpinionNewsArticle' : 'Article',
            '@id': `${url}#article`,
            headline: item.title.slice(0, 110),
            description: item.summary,
            url,
            mainEntityOfPage: url,
            inLanguage: 'sr-Latn',
            datePublished: item.published_at,
            image: [DEFAULT_IMAGE],
            ...(item.topic ? { articleSection: item.topic.name } : {}),
            author: { '@type': 'Person', name: item.author.name, ...(item.author.byline ? { jobTitle: item.author.byline } : {}) },
            publisher: SITE_ORGANIZATION,
          },
          breadcrumbs([
            { name: 'Fiskultura', path: '/' },
            { name: 'Kolumne i tekstovi', path: '/tekstovi' },
            { name: item.title, path },
          ]),
        ],
      });
    });
  }
}
