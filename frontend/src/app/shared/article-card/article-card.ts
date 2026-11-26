import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate } from '../../core/content/content.model';
import { ARTICLE_KIND_LABELS, ArticleItem } from '../../features/articles/article.model';
import { AuthorByline } from '../author-byline/author-byline';

@Component({
  selector: 'app-article-card',
  imports: [RouterLink, AuthorByline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'article-card', '[class.article-card-featured]': 'article().featured', '[class.accent-violet]': 'article().kind === "kolumna"', '[class.accent-sky]': 'article().kind === "clanak"' },
  template: `
    @let item = article();
    <span class="article-card-labels">
      <span class="kind-label">{{ kindLabels[item.kind] }}</span>
      @if (item.topic; as topic) {
        <span class="topic-label">{{ topic.name }}</span>
      }
    </span>
    <h3><a class="post-title" [routerLink]="['/tekstovi', item.slug]">{{ item.title }}</a></h3>
    <p class="muted small article-card-summary">{{ item.summary }}</p>
    <app-author-byline [author]="item.author" [date]="date()" />
  `,
})
export class ArticleCard {
  readonly article = input.required<ArticleItem>();

  protected readonly kindLabels = ARTICLE_KIND_LABELS;
  protected readonly date = computed(() => formatDate(this.article().published_at));
}
