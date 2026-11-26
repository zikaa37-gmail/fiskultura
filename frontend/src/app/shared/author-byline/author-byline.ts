import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ArticleAuthor } from '../../features/articles/article.model';

@Component({
  selector: 'app-author-byline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'author-byline', '[class.author-byline-large]': 'large()' },
  template: `
    <span class="author-avatar" aria-hidden="true">{{ initials() }}</span>
    <span class="author-text">
      <strong>{{ author().name }}</strong>
      @if (author().byline) {
        <span class="small muted">{{ author().byline }}</span>
      }
      @if (date()) {
        <span class="small muted">{{ date() }}</span>
      }
    </span>
  `,
})
export class AuthorByline {
  readonly author = input.required<ArticleAuthor>();
  readonly date = input('');
  readonly large = input(false);

  protected readonly initials = computed(() =>
    (this.author().name ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(''),
  );
}
