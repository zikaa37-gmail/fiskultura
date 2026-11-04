import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NewsDialogService } from '../news-dialog/news-dialog';
import { RouterLink } from '@angular/router';
import { formatDate, NEWS_CATEGORY_LABELS, NewsItem, organizationLabel, SOURCE_TYPE_LABELS } from '../../core/content/content.model';

@Component({
  selector: 'app-news-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'post' },
  template: `
    @let item = news();
    <span class="post-meta">
      @if (date()) {
        <span>{{ date() }}</span>
      }
      <span class="post-category">{{ categoryLabels[item.category] }}</span>
    </span>
    <h3><a class="post-title" [attr.href]="'/vesti/' + item.slug" (click)="open($event)">{{ item.title }}</a></h3>
    <p class="muted">{{ item.summary }}</p>
    <div class="source-row">
      @if (item.organization; as organization) {
        <a class="source-chip" [routerLink]="['/udruzenja', organization.slug]" [title]="organization.name">{{ label(organization) }}</a>
      }
      @if (item.source.url; as url) {
        <a class="inline-link small" [href]="url" target="_blank" rel="noopener">
          Preuzeto sa: {{ item.source.type ? sourceLabels[item.source.type] : 'izvor' }} →
        </a>
      }
    </div>
  `,
})
export class NewsCard {
  readonly news = input.required<NewsItem>();

  protected readonly categoryLabels = NEWS_CATEGORY_LABELS;
  protected readonly sourceLabels = SOURCE_TYPE_LABELS;
  protected readonly label = organizationLabel;
  protected readonly date = computed(() => formatDate(this.news().source.published_at));

  readonly #dialog = inject(NewsDialogService);

  protected open(event: MouseEvent): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    this.#dialog.open(this.news().slug);
  }
}
