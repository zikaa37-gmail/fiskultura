import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../../theme/ui/button';
import { API_URL, apiErrorMessage } from '../../../core/http/api';
import { NotificationService } from '../../../core/notification.service';
import { FilterChange, FilterField, ListFilters } from '../../../shared/list-filters/list-filters';
import { ListHeader } from '../../../shared/list-header/list-header';
import { Pagination } from '../../../shared/pagination/pagination';
import { ScrollArea } from '../../../shared/scroll-area/scroll-area';
import { ComposeDialogService } from './compose-dialog';
import { addressLabel, folderLabel, MailFolder, mailDate, MailSummary } from './mailbox.model';

interface MessagesPage {
  data: MailSummary[];
  meta: { current_page: number; last_page: number; total: number };
}

@Component({
  selector: 'app-admin-mailbox',
  imports: [RouterLink, MatProgressBarModule, BUTTON_IMPORTS, ListFilters, ListHeader, Pagination, ScrollArea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (folders.error(); as error) {
      <div class="empty-state">
        <h3>Pošta nije dostupna</h3>
        <p class="muted">{{ errorText(error) }}</p>
      </div>
    } @else {
      <p class="small muted mb-2">{{ address() }}</p>
      <app-list-filters [fields]="fields()" [values]="filterValues()" emptySummary="Primljeno" (filterChange)="setFilter($event)" (clearAll)="clear()" />
      <app-list-header [count]="meta()?.total ?? null" label="Mejlova">
        <button type="button" mat-flat-button (click)="compose()">Nov mejl</button>
      </app-list-header>
      @if (messages.isLoading() || folders.isLoading()) {
        <mat-progress-bar mode="indeterminate" />
      }
      @if (messages.error(); as error) {
        <p class="form-error" role="alert">{{ errorText(error) }}</p>
      }
      <app-scroll-area label="Mejlovi" [fill]="true" [resetOn]="[current(), pretraga(), page()]">
        <div class="mail-list">
          @for (item of items(); track item.uid) {
            <a class="mail-row" [class.mail-row-unread]="!item.seen" [routerLink]="[item.uid]" [queryParams]="{ folder: current() }">
              <span class="mail-row-head">
                <span class="mail-from">{{ isSent() ? 'Za: ' + (item.to[0] ? label(item.to[0]) : '—') : label(item.from) }}</span>
                <span class="small muted">{{ date(item.date) }}</span>
              </span>
              <span class="mail-subject">{{ item.subject }}</span>
            </a>
          } @empty {
            @if (!messages.isLoading() && !messages.error()) {
              <p class="muted">{{ pretraga() ? 'Nema mejlova za ovu pretragu.' : 'Folder je prazan.' }}</p>
            }
          }
        </div>
      </app-scroll-area>
      @if (meta(); as info) {
        <app-pagination [page]="page()" [lastPage]="info.last_page" (pageChange)="setFilter({ key: 'strana', value: $event > 1 ? '' + $event : '' })" />
      }
    }
  `,
  styles: `
    .mail-list {
      display: grid;
      gap: 6px;
    }
    .mail-row {
      display: grid;
      gap: 2px;
      min-height: 44px;
      padding: 10px 14px;
      border: 1px solid var(--color-border);
      border-radius: 10px;
      background: var(--color-surface);
      color: var(--color-text);
      text-decoration: none;
      overflow-wrap: anywhere;
    }
    .mail-row:hover {
      border-color: var(--color-primary);
    }
    .mail-row-unread {
      border-left: 4px solid var(--color-primary);
    }
    .mail-row-unread .mail-from,
    .mail-row-unread .mail-subject {
      font-weight: 700;
    }
    .mail-row-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .mail-from {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .mail-subject {
      color: var(--color-muted);
    }
    .mail-row-unread .mail-subject {
      color: var(--color-text);
    }
  `,
})
export class AdminMailbox {
  readonly folder = input<string>();
  readonly pretraga = input<string>();
  readonly strana = input<string>();

  readonly #router = inject(Router);
  readonly #compose = inject(ComposeDialogService);
  readonly #notifications = inject(NotificationService);

  protected readonly folders = httpResource<{ address: string; folders: MailFolder[] }>(() => `${API_URL}/admin/mailbox/folders`);
  protected readonly address = computed(() => this.folders.value()?.address ?? '');
  protected readonly current = computed(() => this.folder() || 'INBOX');
  protected readonly page = computed(() => Math.max(1, Number(this.strana()) || 1));
  protected readonly isSent = computed(() => /sent/i.test(this.current()));
  protected readonly fields = computed<FilterField[]>(() => [
    {
      key: 'folder',
      label: 'Folder',
      allLabel: 'Primljeno',
      options: (this.folders.value()?.folders ?? [])
        .filter((item) => item.path !== 'INBOX')
        .map((item) => ({ value: item.path, label: `${folderLabel(item)} (${item.total})` })),
    },
    { key: 'pretraga', label: 'Pretraga (pošiljalac, naslov, tekst)', type: 'search' },
  ]);
  protected readonly filterValues = computed(() => ({ folder: this.current() === 'INBOX' ? '' : this.current(), pretraga: this.pretraga() ?? '' }));

  protected readonly messages = httpResource<MessagesPage>(() => {
    const params = new URLSearchParams({ folder: this.current(), page: `${this.page()}` });
    if (this.pretraga()) params.set('q', this.pretraga()!);
    return this.folders.hasValue() ? `${API_URL}/admin/mailbox/messages?${params}` : undefined;
  });
  readonly #last = linkedSignal<MessagesPage | undefined, MessagesPage | null>({
    source: () => (this.messages.hasValue() ? this.messages.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });
  protected readonly items = computed(() => this.#last()?.data ?? []);
  protected readonly meta = computed(() => this.#last()?.meta ?? null);

  protected setFilter(change: FilterChange): void {
    const queryParams: Record<string, string | null> = { [change.key]: change.value || null };
    if (change.key !== 'strana') {
      queryParams['strana'] = null;
    }
    this.#router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: change.key !== 'strana' });
  }

  protected clear(): void {
    this.#router.navigate([], { queryParams: {} });
  }

  protected compose(): void {
    this.#compose
      .open()
      .afterClosed()
      .subscribe((sent) => {
        if (sent) {
          this.#notifications.show('Mejl je poslat.');
          this.messages.reload();
        }
      });
  }

  protected label = addressLabel;

  protected date(value: string | null): string {
    return mailDate(value);
  }

  protected errorText(error: unknown): string {
    return apiErrorMessage(error);
  }
}
