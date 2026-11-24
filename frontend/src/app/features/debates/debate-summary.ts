import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { formatDate } from '../../core/content/content.model';
import { DebateSummary, POST_KIND_LABELS, SUPPORT_LABELS } from './debate.model';

@Component({
  selector: 'app-debate-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'debate-summary', '[class.debate-summary-draft]': 'draft()' },
  template: `
    @let data = summary();
    <p class="eyebrow mb-1">{{ draft() ? 'Nacrt analize — vidi samo moderator' : 'Sažetak rasprave' }}</p>
    <p class="small muted mb-3">
      @if (data.generated_at) {
        {{ draft() ? 'Napravljeno' : 'Objavljeno' }} {{ date(data.generated_at) }}
      }
      @if (data.posts_analyzed) {
        · na osnovu {{ data.posts_analyzed }} priloga · AI uz proveru moderatora
      }
    </p>
    <p class="mb-4">{{ data.overview }}</p>

    @if (data.positions.length) {
      <h3 class="mb-2">Glavna mišljenja</h3>
      <ul class="summary-list">
        @for (item of data.positions; track $index) {
          <li>
            <strong>{{ item.title }}</strong>
            <span class="state-chip" [class]="item.support === 'jaka' ? 'state-ok' : item.support === 'srednja' ? 'state-warn' : 'state-muted'">{{ supportLabels[item.support] }}</span>
            <p class="small">{{ item.summary }}</p>
          </li>
        }
      </ul>
    }

    @if (data.conclusions.length) {
      <h3 class="mb-2">Zaključci</h3>
      <ul class="summary-list">
        @for (item of data.conclusions; track $index) {
          <li>{{ item }}</li>
        }
      </ul>
    }

    @if (data.suggestions.length) {
      <h3 class="mb-2">Predlozi kolega</h3>
      <ul class="summary-list">
        @for (item of data.suggestions; track $index) {
          <li>{{ item.text }}</li>
        }
      </ul>
    }

    @if (data.best_posts.length) {
      <h3 class="mb-2">Najbolji komentari</h3>
      <div class="summary-quotes mb-4">
        @for (item of data.best_posts; track item.post_id) {
          <blockquote>
            <p class="small muted mb-1">{{ kindLabels[item.kind] }} · {{ item.author }} · {{ item.likes_count }} lajk.</p>
            <p>{{ item.excerpt }}</p>
            <p class="small"><em>{{ item.reason }}</em></p>
          </blockquote>
        }
      </div>
    }

    @if (data.open_questions.length) {
      <h3 class="mb-2">Ostalo otvoreno</h3>
      <ul class="summary-list">
        @for (item of data.open_questions; track $index) {
          <li>{{ item }}</li>
        }
      </ul>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 16px;
      border: 1px solid var(--color-border);
      border-left: 4px solid var(--color-lime);
      border-radius: var(--radius);
      background: var(--color-surface);
    }
    :host(.debate-summary-draft) {
      border-left-color: var(--color-orange);
      border-style: dashed;
    }
    h3 {
      font-size: 16px;
    }
    .summary-list {
      display: grid;
      gap: 8px;
      margin: 0 0 16px;
      padding-left: 20px;
    }
    .summary-list:last-child {
      margin-bottom: 0;
    }
    .summary-list strong {
      margin-right: 8px;
    }
    .summary-list p {
      margin: 4px 0 0;
    }
    .summary-quotes {
      display: grid;
      gap: 8px;
    }
    blockquote {
      margin: 0;
      padding: 10px 12px;
      border-left: 3px solid var(--color-border);
      background: var(--color-bg);
      border-radius: 8px;
    }
    blockquote p {
      margin: 0;
    }
    @media (min-width: 900px) {
      :host {
        padding: 20px 24px;
      }
    }
  `,
})
export class DebateSummaryCard {
  readonly summary = input.required<DebateSummary>();
  readonly draft = input(false);

  protected readonly supportLabels = SUPPORT_LABELS;
  protected readonly kindLabels = POST_KIND_LABELS;

  protected date(value: string): string {
    return formatDate(value);
  }
}
