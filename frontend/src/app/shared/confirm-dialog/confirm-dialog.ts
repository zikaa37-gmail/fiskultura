import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BUTTON_IMPORTS, ButtonTheme } from '../../../theme/ui/button';
import { Observable } from 'rxjs';
import { DialogShell } from '../dialog-shell/dialog-shell';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  theme?: ButtonTheme;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, BUTTON_IMPORTS, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="data.title">
      <p>{{ data.message }}</p>
      <ng-container dialogActions>
        <button type="button" mat-button [mat-dialog-close]="false">{{ data.cancelLabel ?? 'Otkaži' }}</button>
        <button type="button" mat-flat-button [theme]="data.theme ?? 'danger'" [mat-dialog-close]="true">{{ data.confirmLabel }}</button>
      </ng-container>
    </app-dialog-shell>
  `,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly #dialog = inject(MatDialog);

  confirm(data: ConfirmDialogData): Observable<boolean | undefined> {
    return this.#dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, { data, width: '440px', maxWidth: 'calc(100vw - 32px)', panelClass: 'app-dialog-panel' })
      .afterClosed();
  }
}
