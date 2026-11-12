import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../../theme/ui/button';
import { API_URL, apiErrorMessage } from '../../../core/http/api';
import { NotificationService } from '../../../core/notification.service';
import { FilterChange, FilterField, ListFilters } from '../../../shared/list-filters/list-filters';
import { ListHeader } from '../../../shared/list-header/list-header';
import { Pagination } from '../../../shared/pagination/pagination';
import { ScrollArea } from '../../../shared/scroll-area/scroll-area';
import { MenuOption, OptionsMenu } from '../../../shared/options-menu/options-menu';
import { MailActionsService, mailOptions } from './mail-actions';
import { MailMessageData, MailMessageDialog } from './mail-message-dialog';
import { ComposeDialogService } from './compose-dialog';
import { addressLabel, folderLabel, MailAction, MailFolder, mailDate, MailSummary } from './mailbox.model';

interface MessagesPage {
  data: MailSummary[];
  meta: { current_page: number; last_page: number; total: number };
}

@Component({
  selector: 'app-admin-mailbox',
  imports: [MatProgressBarModule, BUTTON_IMPORTS, ListFilters, ListHeader, Pagination, ScrollArea, OptionsMenu],
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
      <app-list-header [count]="meta()?.total ?? null" [page]="page()" [lastPage]="meta()?.last_page ?? null" label="Mejlova">
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
            <div class="mail-row" [class.mail-row-unread]="!item.seen">
              <button type="button" class="mail-row-main" (click)="open(item)">
                <span class="mail-row-head">
                  <span class="mail-from">{{ isSent() ? 'Za: ' + (item.to[0] ? label(item.to[0]) : '—') : label(item.from) }}</span>
                  <span class="small muted">{{ date(item.date) }}</span>
                </span>
                <span class="mail-subject">{{ item.subject }}</span>
              </button>
              <app-options-menu [options]="options(item)" [label]="'Opcije za: ' + item.subject" (selected)="act(item, $event)" />
            </div>
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
      display: flex;
      align-items: center;
      gap: 4px;
      padding-right: 4px;
      border: 1px solid var(--color-border);
      border-radius: 10px;
      background: var(--color-surface);
    }
    .mail-row-main {
      display: grid;
      flex: 1;
      gap: 2px;
      min-width: 0;
      min-height: 44px;
      padding: 10px 14px;
      border: 0;
      background: transparent;
      color: var(--color-text);
      font: inherit;
      text-align: left;
      cursor: pointer;
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
  readonly #dialog = inject(MatDialog);
  readonly #actions = inject(MailActionsService);

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
  protected readonly items = computed(() => (this.#last()?.data ?? []).map((item) => (this.#seen()[item.uid] ? { ...item, seen: true } : item)));
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

  readonly #seen = signal<Record<number, boolean>>({});
  protected readonly role = computed(() => (this.folders.value()?.folders ?? []).find((item) => item.path === this.current())?.role ?? null);

  protected options(item: MailSummary): MenuOption<MailAction>[] {
    return mailOptions(item, this.role());
  }

  protected open(item: MailSummary): void {
    this.#seen.update((all) => ({ ...all, [item.uid]: true }));
    this.#dialog
      .open<MailMessageDialog, MailMessageData, boolean>(MailMessageDialog, {
        data: { uid: item.uid, folder: this.current(), folders: this.folders.value()?.folders ?? [] },
        width: '860px',
        maxWidth: '100vw',
        panelClass: 'app-dialog-panel',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((changed) => changed && this.#refresh());
  }

  protected act(item: MailSummary, action: MailAction): void {
    if (action === 'open') {
      this.open(item);
      return;
    }
    this.#actions.run(item.uid, this.current(), action, this.folders.value()?.folders ?? [], this.role()).subscribe({
      next: (message) => {
        if (message) {
          this.#notifications.show(message);
          this.#refresh();
        }
      },
      error: (error) => this.#notifications.show(apiErrorMessage(error)),
    });
  }

  #refresh(): void {
    this.#seen.set({});
    this.messages.reload();
    this.folders.reload();
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
