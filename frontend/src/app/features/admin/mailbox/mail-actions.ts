import { ChangeDetectionStrategy, Component, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { Observable, of, switchMap, map } from 'rxjs';
import { BUTTON_IMPORTS } from '../../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../../theme/ui/form-field';
import { API_URL } from '../../../core/http/api';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm-dialog';
import { DialogShell } from '../../../shared/dialog-shell/dialog-shell';
import { MenuOption } from '../../../shared/options-menu/options-menu';
import { FolderRole, folderLabel, MailAction, MailFolder, MailSummary } from './mailbox.model';

export function mailOptions(mail: Pick<MailSummary, 'seen'>, role: FolderRole, withOpen = true): MenuOption<MailAction>[] {
  const options: MenuOption<MailAction>[] = [];
  if (withOpen) {
    options.push({ value: 'open', label: 'Otvori', icon: 'eye' });
  }
  options.push(mail.seen ? { value: 'unread', label: 'Označi kao nepročitano', icon: 'mail' } : { value: 'read', label: 'Označi kao pročitano', icon: 'check' });
  if (role !== 'inbox') {
    options.push({ value: 'inbox', label: 'Vrati u Primljeno', icon: 'arrow-left' });
  }
  if (role !== 'archive') {
    options.push({ value: 'archive', label: 'Arhiviraj', icon: 'checklist' });
  }
  options.push({ value: 'move', label: 'Premesti u folder…', icon: 'arrow-right' });
  if (role !== 'junk') {
    options.push({ value: 'spam', label: 'Neželjeno (spam)', icon: 'ban' });
  }
  options.push({ value: 'delete', label: role === 'trash' ? 'Obriši trajno' : 'Obriši', icon: 'trash', danger: true, dividerBefore: true });
  return options;
}

@Injectable({ providedIn: 'root' })
export class MailActionsService {
  readonly #http = inject(HttpClient);
  readonly #dialog = inject(MatDialog);
  readonly #confirm = inject(ConfirmService);

  run(uid: number, folder: string, action: Exclude<MailAction, 'open'>, folders: MailFolder[], role: FolderRole): Observable<string | null> {
    if (action === 'read' || action === 'unread') {
      return this.#http.patch(`${API_URL}/admin/mailbox/messages/${uid}`, { folder, seen: action === 'read' }).pipe(map(() => (action === 'read' ? 'Označeno kao pročitano.' : 'Označeno kao nepročitano.')));
    }
    if (action === 'move') {
      return this.#dialog
        .open<MoveFolderDialog, MoveFolderData, string>(MoveFolderDialog, { data: { folders: folders.filter((item) => item.path !== folder) }, width: '420px', maxWidth: '100vw', panelClass: 'app-dialog-panel', autoFocus: false })
        .afterClosed()
        .pipe(switchMap((target) => (target ? this.#act(uid, folder, 'move', target) : of(null))));
    }
    if (action === 'delete' && role === 'trash') {
      return this.#confirm
        .confirm({ title: 'Trajno brisanje', message: 'Mejl se briše iz Otpada i ne može da se vrati.', confirmLabel: 'Obriši trajno' })
        .pipe(switchMap((confirmed) => (confirmed ? this.#act(uid, folder, 'delete') : of(null))));
    }
    return this.#act(uid, folder, action);
  }

  #act(uid: number, folder: string, action: string, target?: string): Observable<string> {
    return this.#http.post<{ message: string }>(`${API_URL}/admin/mailbox/messages/${uid}/action`, { folder, action, target: target ?? null }).pipe(map((response) => response.message));
  }
}

interface MoveFolderData {
  folders: MailFolder[];
}

@Component({
  selector: 'app-move-folder-dialog',
  imports: [FormsModule, MatDialogModule, MatSelectModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell title="Premesti u folder">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Folder</mat-label>
        <mat-select [ngModel]="target()" (ngModelChange)="target.set($event)">
          @for (folder of data.folders; track folder.path) {
            <mat-option [value]="folder.path">{{ label(folder) }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <ng-container dialogActions>
        <button type="button" mat-stroked-button mat-dialog-close>Odustani</button>
        <button type="button" mat-flat-button [disabled]="!target()" (click)="ref.close(target())">Premesti</button>
      </ng-container>
    </app-dialog-shell>
  `,
  styles: `
    mat-form-field {
      width: 100%;
    }
  `,
})
export class MoveFolderDialog {
  protected readonly ref = inject(MatDialogRef<MoveFolderDialog, string>);
  protected readonly data = inject<MoveFolderData>(MAT_DIALOG_DATA);
  protected readonly target = signal<string | null>(null);
  protected label = folderLabel;
}
