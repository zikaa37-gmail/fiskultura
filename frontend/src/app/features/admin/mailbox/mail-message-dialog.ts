import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../../theme/ui/button';
import { API_URL, apiErrorMessage } from '../../../core/http/api';
import { NotificationService } from '../../../core/notification.service';
import { DialogShell } from '../../../shared/dialog-shell/dialog-shell';
import { Icon } from '../../../shared/icon/icon';
import { MenuOption, OptionsMenu } from '../../../shared/options-menu/options-menu';
import { MailActionsService, mailOptions } from './mail-actions';
import { ComposeDialogService } from './compose-dialog';
import { addressList, ComposeData, fileSize, MailAction, MailAttachment, MailFolder, MailMessage } from './mailbox.model';

export interface MailMessageData {
  uid: number;
  folder: string;
  folders: MailFolder[];
}

@Component({
  selector: 'app-mail-message-dialog',
  imports: [MatDialogModule, MatProgressBarModule, BUTTON_IMPORTS, Icon, DialogShell, OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="message.value()?.subject ?? 'Mejl'">
    @if (message.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    @if (message.error(); as error) {
      <div class="empty-state"><h3>Mejl nije dostupan</h3><p class="muted">{{ errorText(error) }}</p></div>
    }
    @if (message.value(); as mail) {
      <article class="mail">
        <dl class="mail-head small">
          <dt>Od</dt>
          <dd>{{ list(mail.from ? [mail.from] : []) }}</dd>
          <dt>Za</dt>
          <dd>{{ list(mail.to) || '—' }}</dd>
          @if (mail.cc.length) {
            <dt>Kopija</dt>
            <dd>{{ list(mail.cc) }}</dd>
          }
          <dt>Datum</dt>
          <dd>{{ fullDate(mail.date) }}</dd>
        </dl>
        @if (mail.attachments.length) {
          <div class="mail-attachments">
            @for (file of mail.attachments; track file.index) {
              <button type="button" mat-stroked-button size="sm" (click)="download(mail, file)">
                <app-icon name="pdf" [size]="16" /> {{ file.name }} · {{ size(file.size) }}
              </button>
            }
          </div>
        }
        @if (mail.html) {
          <div class="mail-html-bar small">
            @if (!showImages()) {
              <span class="muted">Slike sa interneta su isključene, da pošiljalac ne vidi da je mejl otvoren.</span>
              <button type="button" mat-button theme="tertiary" size="sm" (click)="showImages.set(true)">Prikaži slike</button>
            }
            @if (mail.text) {
              <button type="button" mat-button theme="tertiary" size="sm" (click)="plain.set(!plain())">{{ plain() ? 'HTML prikaz' : 'Samo tekst' }}</button>
            }
          </div>
        }
        @if (mail.html && !plain()) {
          <iframe class="mail-frame" title="Sadržaj mejla" sandbox="allow-popups allow-popups-to-escape-sandbox" [srcdoc]="htmlDoc()"></iframe>
        } @else {
          <pre class="mail-text">{{ mail.text ?? '' }}</pre>
        }
      </article>
    }
    <ng-container dialogActions>
      @if (message.value(); as mail) {
        <app-options-menu [options]="options(mail)" label="Još opcija" (selected)="act(mail, $event)" />
        <button type="button" mat-stroked-button (click)="forward(mail)">Prosledi</button>
        @if (mail.to.length + mail.cc.length > 1) {
          <button type="button" mat-stroked-button (click)="reply(mail, true)">Odgovori svima</button>
        }
        <button type="button" mat-flat-button (click)="reply(mail, false)">Odgovori</button>
      }
    </ng-container>
    </app-dialog-shell>
  `,
  styles: `
    .mail {
      display: grid;
      gap: 12px;
    }
    .mail-head {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 4px 12px;
      margin: 0;
    }
    .mail-head dt {
      color: var(--color-muted);
    }
    .mail-head dd {
      margin: 0;
      overflow-wrap: anywhere;
    }
    .mail-actions,
    .mail-attachments,
    .mail-html-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .mail-frame {
      width: 100%;
      height: max(360px, 55dvh);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: #ffffff;
    }
    .mail-text {
      margin: 0;
      padding: 16px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: var(--color-surface);
      font: inherit;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
  `,
})
export class MailMessageDialog {
  readonly #http = inject(HttpClient);
  readonly #ref = inject(MatDialogRef<MailMessageDialog, boolean>);
  readonly #sanitizer = inject(DomSanitizer);
  readonly #compose = inject(ComposeDialogService);
  readonly #actions = inject(MailActionsService);
  readonly #notifications = inject(NotificationService);
  protected readonly data = inject<MailMessageData>(MAT_DIALOG_DATA);

  protected readonly current = signal(this.data.folder);
  readonly #role = this.data.folders.find((folder) => folder.path === this.data.folder)?.role ?? null;
  protected readonly showImages = signal(false);
  protected readonly plain = signal(false);
  protected readonly message = httpResource<MailMessage>(() => `${API_URL}/admin/mailbox/messages/${this.data.uid}?folder=${encodeURIComponent(this.current())}`);
  protected readonly htmlDoc = computed<SafeHtml>(() => {
    const images = this.showImages() ? ' https: http:' : '';
    const policy = `default-src 'none'; style-src 'unsafe-inline'; img-src data: cid:${images}; font-src data:`;
    const html = this.message.value()?.html ?? '';
    return this.#sanitizer.bypassSecurityTrustHtml(`<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><base target="_blank"><style>body{font-family:system-ui,sans-serif;margin:16px;color:#0b1736;overflow-wrap:anywhere}img{max-width:100%;height:auto}</style>${html}`);
  });

  protected list = addressList;
  protected size = fileSize;

  protected fullDate(value: string | null): string {
    return value ? new Date(value).toLocaleString('sr-Latn-RS', { dateStyle: 'medium', timeStyle: 'short' }) : '';
  }

  protected errorText(error: unknown): string {
    return apiErrorMessage(error);
  }

  protected reply(mail: MailMessage, all: boolean): void {
    const sender = mail.reply_to.length ? mail.reply_to : mail.from ? [mail.from] : [];
    const others = all ? [...mail.to, ...mail.cc].filter((item) => !/^admin@fiskultura\.rs$/i.test(item.email) && !sender.some((s) => s.email === item.email)) : [];
    this.#open({
      to: sender.map((item) => item.email).join(', '),
      cc: others.map((item) => item.email).join(', '),
      subject: /^re:/i.test(mail.subject) ? mail.subject : `Re: ${mail.subject}`,
      body: `\n\n${this.quote(mail)}`,
      inReplyTo: mail.message_id,
      references: mail.references,
    });
  }

  protected forward(mail: MailMessage): void {
    this.#open({
      subject: /^fwd?:/i.test(mail.subject) ? mail.subject : `Fwd: ${mail.subject}`,
      body: `\n\n---------- Prosleđena poruka ----------\nOd: ${addressList(mail.from ? [mail.from] : [])}\nDatum: ${this.fullDate(mail.date)}\nNaslov: ${mail.subject}\nZa: ${addressList(mail.to)}\n\n${this.text(mail)}`,
    });
  }

  protected options(mail: MailMessage): MenuOption<MailAction>[] {
    return mailOptions(mail, this.#role, false);
  }

  protected act(mail: MailMessage, action: MailAction): void {
    if (action === 'open') {
      return;
    }
    this.#actions.run(mail.uid, this.current(), action, this.data.folders, this.#role).subscribe({
      next: (message) => {
        if (message) {
          this.#notifications.show(message);
          this.#ref.close(true);
        }
      },
      error: (error) => this.#notifications.show(apiErrorMessage(error)),
    });
  }

  protected download(mail: MailMessage, file: MailAttachment): void {
    this.#http.get(`${API_URL}/admin/mailbox/messages/${mail.uid}/attachments/${file.index}?folder=${encodeURIComponent(this.current())}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: (error) => this.#notifications.show(apiErrorMessage(error)),
    });
  }

  #open(data: ComposeData): void {
    this.#compose
      .open(data)
      .afterClosed()
      .subscribe((sent) => {
        if (sent) {
          this.#notifications.show('Mejl je poslat.');
          this.#ref.close(true);
        }
      });
  }

  private quote(mail: MailMessage): string {
    const who = mail.from ? addressList([mail.from]) : 'pošiljalac';
    return `${this.fullDate(mail.date)}, ${who} je napisao/la:\n${this.text(mail)
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n')}`;
  }

  private text(mail: MailMessage): string {
    if (mail.text) {
      return mail.text.trim();
    }
    const html = new DOMParser().parseFromString(mail.html ?? '', 'text/html');
    return (html.body.textContent ?? '').trim();
  }
}
