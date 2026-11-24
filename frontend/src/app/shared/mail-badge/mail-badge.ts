import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MailboxStatusService } from '../../core/inbox/mailbox-status.service';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-mail-badge',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (mailbox.unread(); as count) {
      <a
        class="mail-badge"
        [class.mail-badge-wide]="wide()"
        routerLink="/admin/posta"
        [attr.aria-label]="'Pošta admin@, nepročitanih mejlova: ' + count"
        [title]="'Nepročitanih mejlova: ' + count"
      >
        <app-icon name="mail" [size]="20" />
        <span class="mail-badge-count">{{ count > 99 ? '99+' : count }}</span>
        @if (wide()) {
          <span>{{ count === 1 ? 'nepročitan mejl' : 'nepročitanih mejlova' }} u pošti admin@</span>
        }
      </a>
    }
  `,
  styles: `
    .mail-badge {
      position: relative;
      display: inline-grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      background: var(--color-surface);
      color: var(--color-text);
      text-decoration: none;
    }
    .mail-badge:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
    .mail-badge-count {
      position: absolute;
      top: 2px;
      right: 0;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border: 2px solid var(--color-surface);
      border-radius: 999px;
      background: var(--color-rose);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      line-height: 14px;
      text-align: center;
    }
    .mail-badge-wide {
      display: inline-flex;
      gap: 10px;
      width: auto;
      min-height: 44px;
      padding: 0 14px;
    }
    .mail-badge-wide .mail-badge-count {
      position: static;
      border: 0;
    }
  `,
})
export class MailBadge {
  readonly wide = input(false);
  protected readonly mailbox = inject(MailboxStatusService);
}
