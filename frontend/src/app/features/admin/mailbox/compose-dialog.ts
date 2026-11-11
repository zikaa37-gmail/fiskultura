import { ChangeDetectionStrategy, Component, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { BUTTON_IMPORTS } from '../../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../../theme/ui/form-field';
import { API_URL, apiErrorMessage } from '../../../core/http/api';
import { DialogShell } from '../../../shared/dialog-shell/dialog-shell';
import { ComposeData } from './mailbox.model';

@Component({
  selector: 'app-compose-dialog',
  imports: [FormsModule, MatDialogModule, MatInputModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="data.inReplyTo ? 'Odgovor' : 'Nov mejl'">
      <div class="compose">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Za</mat-label>
          <input matInput type="text" inputmode="email" [ngModel]="to()" (ngModelChange)="to.set($event)" placeholder="ime@primer.rs, drugi@primer.rs" />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Kopija (Cc)</mat-label>
          <input matInput type="text" inputmode="email" [ngModel]="cc()" (ngModelChange)="cc.set($event)" />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Naslov</mat-label>
          <input matInput maxlength="250" [ngModel]="subject()" (ngModelChange)="subject.set($event)" />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Poruka</mat-label>
          <textarea matInput rows="12" [ngModel]="body()" (ngModelChange)="body.set($event)"></textarea>
        </mat-form-field>
        <p class="small muted">Šalje se sa adrese admin@fiskultura.rs, a kopija ostaje u folderu „Poslato”.</p>
        @if (error(); as text) {
          <p class="form-error" role="alert">{{ text }}</p>
        }
      </div>
      <ng-container dialogActions>
        <button type="button" mat-stroked-button mat-dialog-close>Odustani</button>
        <button type="button" mat-flat-button [disabled]="busy()" (click)="send()">{{ busy() ? 'Šaljem…' : 'Pošalji' }}</button>
      </ng-container>
    </app-dialog-shell>
  `,
  styles: `
    .compose {
      display: grid;
      gap: 12px;
    }
    mat-form-field {
      width: 100%;
    }
  `,
})
export class ComposeDialog {
  readonly #http = inject(HttpClient);
  readonly #ref = inject(MatDialogRef<ComposeDialog, boolean>);
  protected readonly data = inject<ComposeData>(MAT_DIALOG_DATA);

  protected readonly to = signal(this.data.to ?? '');
  protected readonly cc = signal(this.data.cc ?? '');
  protected readonly subject = signal(this.data.subject ?? '');
  protected readonly body = signal(this.data.body ?? '');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected send(): void {
    const to = splitAddresses(this.to());
    if (!to.length) {
      this.error.set('Unesite bar jednu adresu primaoca.');
      return;
    }
    if (!this.subject().trim() || !this.body().trim()) {
      this.error.set('Naslov i poruka su obavezni.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.#http
      .post(`${API_URL}/admin/mailbox/send`, {
        to,
        cc: splitAddresses(this.cc()),
        subject: this.subject().trim(),
        body: this.body(),
        in_reply_to: this.data.inReplyTo ?? null,
        references: this.data.references ?? null,
      })
      .subscribe({
        next: () => this.#ref.close(true),
        error: (error) => {
          this.busy.set(false);
          this.error.set(apiErrorMessage(error));
        },
      });
  }
}

function splitAddresses(value: string): string[] {
  return value
    .split(/[,;]+/)
    .map((item) => item.replace(/^.*<(.+)>$/, '$1').trim())
    .filter(Boolean);
}

@Injectable({ providedIn: 'root' })
export class ComposeDialogService {
  readonly #dialog = inject(MatDialog);

  open(data: ComposeData = {}): MatDialogRef<ComposeDialog, boolean> {
    return this.#dialog.open<ComposeDialog, ComposeData, boolean>(ComposeDialog, { data, width: '720px', maxWidth: '100vw', panelClass: 'app-dialog-panel', autoFocus: false });
  }
}
