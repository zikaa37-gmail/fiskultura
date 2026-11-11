import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { formatDate } from '../../core/content/content.model';
import { Icon } from '../../shared/icon/icon';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { DebatePost, POST_KIND_ICONS, POST_KIND_LABELS } from './debate.model';

export type PostAction = 'highlight' | 'hide';

@Component({
  selector: 'app-debate-post-card',
  imports: [Icon, OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'debate-post', '[class.debate-post-highlighted]': 'post().highlighted', '[class.debate-post-hidden]': 'post().hidden' },
  template: `
    @let item = post();
    <div class="debate-post-head">
      <span class="post-meta">
        <span class="debate-kind" [class]="'debate-kind-' + item.kind"><app-icon [name]="kindIcons[item.kind]" [size]="16" /> {{ kindLabels[item.kind] }}</span>
        <span>{{ item.author }}{{ item.mine ? ' (ti)' : '' }}</span>
        @if (item.created_at) {
          <span>{{ date(item.created_at) }}</span>
        }
        @if (item.highlighted) {
          <span class="state-chip state-ok">istaknuto</span>
        }
        @if (item.hidden) {
          <span class="state-chip state-muted">sakriveno</span>
        }
      </span>
      @if (moderating()) {
        <app-options-menu [options]="options()" label="Opcije priloga" (selected)="moderate.emit($event)" />
      }
    </div>
    <p class="debate-post-body">{{ item.body }}</p>
    <button
      type="button"
      class="like-button"
      [class.like-button-on]="item.liked"
      [attr.aria-pressed]="item.liked"
      [attr.aria-label]="(item.liked ? 'Povuci lajk' : 'Lajkuj') + ', ukupno ' + item.likes_count"
      [disabled]="item.mine || item.hidden"
      (click)="like.emit()"
    >
      <app-icon name="heart" [size]="18" />
      <span>{{ item.likes_count }}</span>
    </button>
  `,
  styles: `
    :host {
      display: grid;
      gap: 8px;
      padding: 14px 16px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: var(--color-surface);
    }
    :host(.debate-post-highlighted) {
      border-color: var(--color-lime-strong);
      box-shadow: inset 4px 0 0 var(--color-lime);
    }
    :host(.debate-post-hidden) {
      opacity: 0.6;
    }
    .debate-post-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }
    .debate-post-body {
      margin: 0;
      white-space: pre-line;
      overflow-wrap: anywhere;
    }
    .debate-kind {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
    }
    .debate-kind-criticism {
      color: var(--color-rose);
    }
    .debate-kind-suggestion {
      color: var(--color-primary);
    }
    .like-button {
      display: inline-flex;
      align-items: center;
      justify-self: start;
      gap: 6px;
      min-width: 44px;
      min-height: 44px;
      padding: 0 12px;
      border: 1px solid var(--color-border);
      border-radius: 999px;
      background: transparent;
      color: var(--color-muted);
      font: inherit;
      cursor: pointer;
    }
    .like-button-on {
      border-color: var(--color-rose);
      color: var(--color-rose);
    }
    .like-button:disabled {
      cursor: default;
    }
  `,
})
export class DebatePostCard {
  readonly post = input.required<DebatePost>();
  readonly moderating = input(false);
  readonly like = output<void>();
  readonly moderate = output<PostAction>();

  protected readonly kindLabels = POST_KIND_LABELS;
  protected readonly kindIcons = POST_KIND_ICONS;
  protected readonly options = computed<MenuOption<PostAction>[]>(() => [
    { value: 'highlight', label: this.post().highlighted ? 'Ukloni isticanje' : 'Istakni kao vredan', icon: 'star' },
    { value: 'hide', label: this.post().hidden ? 'Vrati prilog' : 'Sakrij prilog', icon: this.post().hidden ? 'eye' : 'ban', danger: !this.post().hidden },
  ]);

  protected date(value: string): string {
    return formatDate(value);
  }
}
