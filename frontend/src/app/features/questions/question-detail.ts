import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { formatDate } from '../../core/content/content.model';
import { API_URL, isNotFound } from '../../core/http/api';
import { breadcrumbs, SeoService, SITE_ORGANIZATION, SITE_URL } from '../../core/seo/seo.service';
import { JoinCta } from '../../shared/join-cta/join-cta';
import { questionShare } from '../../shared/social-share/share-data';
import { ShareMenu } from '../../shared/social-share/share-menu';
import { SimpleMarkdownPipe } from '../../shared/simple-markdown.pipe';
import { LEGAL_DISCLAIMER, Question, QUESTION_CATEGORY_LABELS } from './question.model';

@Component({
  selector: 'app-question-detail',
  imports: [RouterLink, BUTTON_IMPORTS, MatProgressBarModule, SimpleMarkdownPipe, JoinCta, ShareMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .small-heading {
      margin: 8px 0 8px;
      font-size: 20px;
    }
    .question-text {
      margin: 8px 0 20px;
      padding: 12px 16px;
      border-left: 4px solid var(--color-primary);
      background: var(--color-surface);
      border-radius: 0 var(--radius) var(--radius) 0;
    }
    .answer {
      margin-bottom: 24px;
    }
    .regulation-refs {
      display: grid;
      gap: 10px;
      margin: 0 0 20px;
      padding: 0;
      list-style: none;
    }
    .regulation-refs li {
      display: grid;
      gap: 2px;
      padding: 12px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
    }
    .regulation-refs a {
      font-weight: 700;
    }
    .disclaimer {
      padding: 12px 16px;
      border-radius: var(--radius);
      border: 1px solid var(--color-border);
    }
    .detail-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 20px;
    }
    .detail-actions .mat-mdc-button-base {
      min-height: 44px;
    }
  `,
  template: `
    <section class="section">
      <div class="container article">
        <a class="inline-link small" routerLink="/pitanja">← Sva pitanja</a>
        @if (resource.isLoading()) {
          <mat-progress-bar mode="indeterminate" />
        } @else if (resource.error()) {
          <div class="empty-state">
            <h1>Pitanje nije pronađeno</h1>
            <p class="muted">Možda je uklonjeno ili je link pogrešan.</p>
            <a mat-flat-button routerLink="/pitanja">Sva pitanja</a>
          </div>
        } @else if (question(); as item) {
          <article class="article-body">
            <div class="post-head">
              <span class="post-meta">
                <span class="post-category">{{ categoryLabels[item.category] }}</span>
                @if (item.valid_on) {
                  <span>važi na dan {{ date(item.valid_on) }}</span>
                }
              </span>
              @if (shareData(); as share) {
                <app-share-menu [data]="share" />
              }
            </div>
            <h1>{{ item.title }}</h1>
            @if (item.body) {
              <p class="question-text">{{ item.body }}</p>
            }
            <h2 class="small-heading">Odgovor</h2>
            <div id="odgovor" class="markdown answer" [innerHTML]="item.answer ?? '' | simpleMarkdown"></div>

            @if (item.regulations?.length) {
              <h2 class="small-heading">Propisi</h2>
              <ul class="regulation-refs">
                @for (regulation of item.regulations; track regulation.key) {
                  <li>
                    @if (regulation.url) {
                      <a [href]="regulation.url" target="_blank" rel="noopener">{{ regulation.title }}</a>
                    } @else {
                      <strong>{{ regulation.title }}</strong>
                    }
                    @if (regulation.gazette) {
                      <span class="muted small">{{ regulation.gazette }}</span>
                    }
                    @if (regulation.status === 'prestao') {
                      <span class="outcomes-warning small">Ovaj propis više ne važi; proverite šta ga je zamenilo na stranici propisa.</span>
                    }
                    <a class="inline-link small" routerLink="/propisi" [queryParams]="{ pretraga: regulation.title }">Šta je bitno za FV →</a>
                  </li>
                }
              </ul>
            }

            <p class="disclaimer muted small">{{ disclaimer }}</p>
            <div class="detail-actions">
              <a mat-flat-button routerLink="/pitanja/postavi">Postavi svoje pitanje</a>
              <a mat-stroked-button routerLink="/pitanja" [queryParams]="{ oblast: item.category }">Još iz ove oblasti</a>
            </div>
            <app-join-cta text="Besplatan nalog: pitaj uredništvo, dobij mejl kad odgovorimo i obaveštenja kad se propisi promene." />
          </article>
        }
      </div>
    </section>
  `,
})
export class QuestionDetail {
  readonly slug = input.required<string>();

  readonly #seo = inject(SeoService);

  protected readonly disclaimer = LEGAL_DISCLAIMER;
  protected readonly categoryLabels = QUESTION_CATEGORY_LABELS;
  protected readonly resource = httpResource<Question>(() => `${API_URL}/questions/${encodeURIComponent(this.slug())}`);
  protected readonly question = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  protected readonly shareData = computed(() => {
    const item = this.question();
    return item ? questionShare(item) : null;
  });

  constructor() {
    effect(() => {
      const item = this.question();
      const path = `/pitanja/${this.slug()}`;
      if (isNotFound(this.resource.error())) {
        this.#seo.set({ title: 'Pitanje nije pronađeno', path, noindex: true });
        return;
      }
      if (!item) {
        return;
      }
      const url = SITE_URL + path;
      const answer = plainText(item.answer ?? '');
      this.#seo.set({
        title: item.title,
        description: item.excerpt,
        path,
        type: 'article',
        publishedTime: item.published_at,
        jsonLd: [
          {
            '@type': 'QAPage',
            '@id': `${url}#page`,
            url,
            inLanguage: 'sr-Latn',
            mainEntity: {
              '@type': 'Question',
              name: item.title,
              text: item.body || item.title,
              answerCount: 1,
              datePublished: item.published_at,
              author: { '@type': 'Person', name: 'Nastavnik fizičkog vaspitanja', url: `${SITE_URL}/pitanja` },
              acceptedAnswer: {
                '@type': 'Answer',
                text: answer,
                url: `${url}#odgovor`,
                datePublished: item.published_at,
                author: SITE_ORGANIZATION,
                upvoteCount: 0,
              },
            },
          },
          breadcrumbs([
            { name: 'Fiskultura', path: '/' },
            { name: 'Pitanja i odgovori', path: '/pitanja' },
            { name: item.title, path },
          ]),
        ],
      });
    });
  }

  protected date(value: string): string {
    return formatDate(value);
  }
}

function plainText(markdown: string): string {
  return markdown
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
    .replace(/^- /gm, '• ')
    .trim();
}
