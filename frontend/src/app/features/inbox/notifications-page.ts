import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { ICON_BUTTON_IMPORTS } from '../../../theme/ui/icon-button';
import { formatDate } from '../../core/content/content.model';
import { API_URL } from '../../core/http/api';
import { CHANNEL_LABELS, InboxItem, InboxService } from '../../core/inbox/inbox.service';
import { MailBadge } from '../../shared/mail-badge/mail-badge';
import { ListHeader } from '../../shared/list-header/list-header';
import { Pagination } from '../../shared/pagination/pagination';
import { ScrollArea } from '../../shared/scroll-area/scroll-area';

interface InboxPage {
  data: InboxItem[];
  meta: { current_page: number; last_page: number; total: number };
  unread: number;
}

@Component({
  selector: 'app-notifications-page',
  imports: [MatProgressBarModule, BUTTON_IMPORTS, ICON_BUTTON_IMPORTS, ListHeader, Pagination, ScrollArea, MailBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section qa-section">
      <div class="container inbox-page">
        <div class="inbox-title mb-2">
          <h1>Notifikacije</h1>
          <button type="button" app-icon-button icon="help" theme="ghost" label="Šta su notifikacije" [attr.aria-expanded]="info()" (click)="info.set(!info())"></button>
        </div>
        @if (info()) {
          <p class="info-box small mb-3">
            Sve što vam portal pošalje: odgovori na pitanja, prilozi u temama koje moderirate, pozivi u debate, vesti. Uz svaku piše kojim
            kanalom je poslata (sada mejl, kasnije i WhatsApp, Viber ili SMS). Dodirom otvarate ono na šta se notifikacija odnosi.
          </p>
        }
        <app-mail-badge class="mail-badge-row" [wide]="true" />
        <div class="chip-row mb-2" role="group" aria-label="Prikaz">
          <button type="button" [matButton]="!onlyUnread() ? 'filled' : 'outlined'" [theme]="!onlyUnread() ? 'primary' : 'tertiary'" size="sm" [attr.aria-pressed]="!onlyUnread()" (click)="show(false)">Sve</button>
          <button type="button" [matButton]="onlyUnread() ? 'filled' : 'outlined'" [theme]="onlyUnread() ? 'primary' : 'tertiary'" size="sm" [attr.aria-pressed]="onlyUnread()" (click)="show(true)">
            Nepročitane{{ inbox.unread() ? ' (' + inbox.unread() + ')' : '' }}
          </button>
        </div>
        <app-list-header [count]="meta()?.total ?? null" [page]="page()" [lastPage]="meta()?.last_page ?? null">
          @if (inbox.unread()) {
            <button type="button" mat-flat-button theme="tertiary" (click)="readAll()">Označi sve kao pročitano</button>
          }
        </app-list-header>
        @if (resource.isLoading()) {
          <mat-progress-bar mode="indeterminate" />
        }
        <app-scroll-area label="Notifikacije" [fill]="true" [resetOn]="[page(), onlyUnread()]">
          <ul class="inbox-list">
            @for (item of items(); track item.id) {
              <li class="inbox-item" [class.inbox-item-unread]="!item.read">
                <button type="button" class="inbox-open" (click)="open(item)">
                  <span class="inbox-item-head">
                    @if (!item.read) {
                      <span class="inbox-dot" aria-label="Nepročitano"></span>
                    }
                    <strong>{{ item.title }}</strong>
                  </span>
                  @if (item.body) {
                    <span class="inbox-body small">{{ item.body }}</span>
                  }
                </button>
                <div class="inbox-meta">
                  <span class="small muted">{{ item.created_at ? date(item.created_at) : '' }}</span>
                  @for (channel of item.channels; track channel) {
                    <span class="reg-label" [title]="'Poslato: ' + (channelLabels[channel] ?? channel)">{{ channel === 'site' ? 'na sajtu' : 'poslato ' + (channelLabels[channel] ?? channel) + 'om' }}</span>
                  }
                </div>
                @if (!item.read) {
                  <button type="button" app-icon-button icon="check" theme="accent" size="sm" class="inbox-read" label="Označi kao pročitano" (click)="markRead(item)"></button>
                }
              </li>
            } @empty {
              @if (!resource.isLoading()) {
                <li class="empty-state">
                  <h3>{{ onlyUnread() ? 'Nema nepročitanih notifikacija' : 'Još nema notifikacija' }}</h3>
                </li>
              }
            }
          </ul>
        </app-scroll-area>
        @if (meta(); as info) {
          <app-pagination [page]="page()" [lastPage]="info.last_page" (pageChange)="go($event)" />
        }
      </div>
    </section>
  `,
  styles: `
    .inbox-page {
      max-width: 860px;
    }
    .inbox-list {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .inbox-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .inbox-title h1 {
      margin: 0;
    }
    .info-box {
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--color-surface-alt);
    }
    .inbox-item {
      position: relative;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 6px 8px;
      padding: 12px 12px 12px 16px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: var(--color-surface);
      overflow-wrap: anywhere;
    }
    .inbox-item:hover {
      border-color: var(--color-primary);
    }
    .inbox-open {
      grid-column: 1;
      display: grid;
      gap: 4px;
      min-height: 44px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--color-text);
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .inbox-open:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 4px;
      border-radius: 4px;
    }
    .inbox-meta {
      grid-column: 1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
    }
    .inbox-read {
      grid-column: 2;
      grid-row: 1;
      align-self: start;
    }
    .inbox-item-unread {
      border-left: 4px solid var(--color-primary);
    }
    .inbox-item-head {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .inbox-dot {
      flex: none;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-rose);
    }
    .inbox-body {
      white-space: pre-line;
    }
  `,
})
export class NotificationsPage {
  readonly strana = input<string>();
  readonly samo = input<string>();

  protected readonly inbox = inject(InboxService);
  readonly #router = inject(Router);
  protected readonly channelLabels = CHANNEL_LABELS;
  protected readonly info = signal(false);

  protected readonly page = computed(() => Math.max(1, Number(this.strana()) || 1));
  protected readonly onlyUnread = computed(() => this.samo() === 'neprocitane');
  protected readonly resource = httpResource<InboxPage>(() => `${API_URL}/me/notifications?page=${this.page()}${this.onlyUnread() ? '&unread=1' : ''}`);
  readonly #last = linkedSignal<InboxPage | undefined, InboxPage | null>({
    source: () => (this.resource.hasValue() ? this.resource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });
  protected readonly items = computed(() => this.#last()?.data ?? []);
  protected readonly meta = computed(() => this.#last()?.meta ?? null);

  constructor() {
    effect(() => {
      const value = this.resource.hasValue() ? this.resource.value() : null;
      if (value) {
        this.inbox.setUnread(value.unread);
      }
    });
  }

  protected show(unread: boolean): void {
    this.#router.navigate([], { queryParams: { samo: unread ? 'neprocitane' : null, strana: null } });
  }

  protected go(page: number): void {
    this.#router.navigate([], { queryParams: { strana: page > 1 ? page : null }, queryParamsHandling: 'merge' });
  }

  protected readAll(): void {
    this.inbox.markRead('all');
    this.resource.reload();
  }

  protected markRead(item: InboxItem): void {
    this.inbox.markRead([item.id]);
    this.#last.update((page) => (page ? { ...page, data: page.data.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)) } : page));
  }

  protected open(item: InboxItem): void {
    if (!item.read) {
      this.inbox.markRead([item.id]);
    }
    if (item.url) {
      this.#router.navigateByUrl(item.url);
    } else {
      this.resource.reload();
    }
  }

  protected date(value: string): string {
    return formatDate(value);
  }
}
