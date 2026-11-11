import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { formatDate } from '../../core/content/content.model';
import { SimpleMarkdownPipe } from '../../shared/simple-markdown.pipe';
import { DebateIntro } from './debate.model';

@Component({
  selector: 'app-debate-intro',
  imports: [SimpleMarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'debate-intro', '[class.debate-intro-draft]': 'draft()' },
  template: `
    @let data = intro();
    <p class="eyebrow mb-1">{{ draft() ? 'Nacrt uvodnog pregleda — ovako će izgledati posle objave' : 'Uvodni pregled' }}</p>
    <p class="small muted mb-3">
      AI uz proveru moderatora{{ data.at ? ' · ' + date(data.at) : '' }}{{ data.sources.length ? ' · izvora: ' + data.sources.length : '' }}
    </p>
    <div class="markdown" [innerHTML]="data.text | simpleMarkdown"></div>
    @if (data.sources.length) {
      <details class="intro-sources">
        <summary class="small">Izvori ({{ data.sources.length }})</summary>
        <ol class="small">
          @for (source of data.sources; track source.url) {
            <li><a class="inline-link" [href]="source.url" target="_blank" rel="noopener">{{ source.title }}</a></li>
          }
        </ol>
      </details>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 16px;
      border: 1px solid var(--color-border);
      border-left: 4px solid var(--color-sky);
      border-radius: var(--radius);
      background: var(--color-surface);
    }
    :host(.debate-intro-draft) {
      border-left-color: var(--color-orange);
      border-style: dashed;
    }
    .intro-sources summary {
      min-height: 44px;
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .intro-sources ol {
      margin: 0;
      padding-left: 20px;
      overflow-wrap: anywhere;
    }
    @media (min-width: 900px) {
      :host {
        padding: 20px 24px;
      }
    }
  `,
})
export class DebateIntroCard {
  readonly intro = input.required<DebateIntro>();
  readonly draft = input(false);

  protected date(value: string): string {
    return formatDate(value);
  }
}
