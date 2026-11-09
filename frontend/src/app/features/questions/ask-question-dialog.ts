import { ChangeDetectionStrategy, Component, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NonNullableFormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { createQuestionForm, QuestionFields, questionPayload } from './question-fields';
import { LEGAL_DISCLAIMER } from './question.model';

@Component({
  selector: 'app-ask-question-dialog',
  imports: [RouterLink, MatButtonModule, MatDialogModule, DialogShell, QuestionFields],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell title="Postavi pitanje">
      @if (sentMessage(); as message) {
        <p role="status">{{ message }}</p>
      } @else {
        <p class="muted mb-4">
          Urednik odgovara uz poziv na propis i objavljuje odgovor <strong>bez vašeg imena i škole</strong>. Javićemo vam mejlom kad
          odgovor bude objavljen.
        </p>
        <app-question-fields [form]="form" />
        @if (error(); as message) {
          <p class="form-error" role="alert">{{ message }}</p>
        }
        <p class="muted small">{{ disclaimer }}</p>
      }
      <ng-container dialogActions>
        @if (sentMessage()) {
          <a mat-button class="btn-tertiary-text" routerLink="/pitanja/postavi" mat-dialog-close>Moja pitanja</a>
          <button type="button" mat-stroked-button (click)="askAnother()">Postavi još jedno</button>
          <button type="button" mat-flat-button mat-dialog-close>Zatvori</button>
        } @else {
          <button type="button" mat-stroked-button mat-dialog-close>Odustani</button>
          <button type="button" mat-flat-button [disabled]="busy()" (click)="submit()">Pošalji pitanje</button>
        }
      </ng-container>
    </app-dialog-shell>
  `,
})
export class AskQuestionDialog {
  readonly #http = inject(HttpClient);

  protected readonly disclaimer = LEGAL_DISCLAIMER;
  protected readonly form = createQuestionForm(inject(NonNullableFormBuilder));
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sentMessage = signal<string | null>(null);

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(this.form.controls.title.invalid ? 'Pitanje ukratko treba da ima bar 10 znakova.' : null);
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.#http.post<{ message: string }>(`${API_URL}/questions`, questionPayload(this.form)).subscribe({
      next: (response) => {
        this.sentMessage.set(response.message);
        this.busy.set(false);
      },
      error: (error) => {
        this.error.set(apiErrorMessage(error));
        this.busy.set(false);
      },
    });
  }

  protected askAnother(): void {
    this.form.reset();
    this.sentMessage.set(null);
  }
}

@Injectable({ providedIn: 'root' })
export class AskQuestionDialogService {
  readonly #dialog = inject(MatDialog);

  open(): MatDialogRef<AskQuestionDialog> {
    return this.#dialog.open(AskQuestionDialog, { width: '640px', maxWidth: '100vw', panelClass: 'app-dialog-panel', autoFocus: false });
  }
}
