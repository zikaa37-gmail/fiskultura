import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { formatDate } from '../../core/content/content.model';
import { Icon } from '../../shared/icon/icon';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { DebatePost, POST_KIND_ICONS, POST_KIND_LABELS, REACTIONS, ReactionType } from './debate.model';

export type PostAction = 'highlight' | 'hide' | 'ban';

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
    <div class="reactions" role="group" aria-label="Reakcije">
      @for (option of reactionOptions; track option.type) {
        <button
          type="button"
          class="reaction"
          [class.reaction-on]="item.reaction === option.type"
          [attr.aria-pressed]="item.reaction === option.type"
          [attr.aria-label]="option.label + ', ' + (item.reactions[option.type] ?? 0)"
          [title]="option.label"
          [disabled]="item.mine || item.hidden || frozen()"
          (click)="react.emit(option.type)"
        >
          <span aria-hidden="true">{{ option.emoji }}</span>
          <span class="reaction-count">{{ item.reactions[option.type] ?? 0 }}</span>
        </button>
      }
    </div>
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
    .reactions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .reaction {
      display: inline-flex;
      align-items: center;
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
    .reaction-on {
      border-color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 12%, transparent);
      color: var(--color-text);
      font-weight: 700;
    }
    .reaction:disabled {
      cursor: default;
    }
  `,
})
export class DebatePostCard {
  readonly post = input.required<DebatePost>();
  readonly moderating = input(false);
  readonly frozen = input(false);
  readonly react = output<ReactionType>();
  readonly moderate = output<PostAction>();

  protected readonly kindLabels = POST_KIND_LABELS;
  protected readonly kindIcons = POST_KIND_ICONS;
  protected readonly reactionOptions = REACTIONS;
  protected readonly options = computed<MenuOption<PostAction>[]>(() => [
    { value: 'highlight', label: this.post().highlighted ? 'Ukloni isticanje' : 'Istakni kao vredan', icon: 'star' },
    { value: 'hide', label: this.post().hidden ? 'Vrati prilog' : 'Sakrij prilog', icon: this.post().hidden ? 'eye' : 'ban', danger: !this.post().hidden },
    ...(this.post().can_ban ? [{ value: 'ban' as const, label: 'Zabrani autoru pisanje', icon: 'ban' as const, danger: true, dividerBefore: true }] : []),
  ]);

  protected date(value: string): string {
    return formatDate(value);
  }
}
