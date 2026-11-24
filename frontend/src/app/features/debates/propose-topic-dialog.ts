import { ChangeDetectionStrategy, Component, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { AuthService } from '../../core/auth/auth.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { Debate } from './debate.model';

@Component({
  selector: 'app-propose-topic-dialog',
  imports: [ReactiveFormsModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatDialogModule, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="staff ? 'Nova tema za razgovor' : 'Predloži temu za razgovor'">
      @if (sent(); as message) {
        <p role="status">{{ message }}</p>
      } @else {
        <p class="muted mb-4">
          @if (staff) {
            Tema se otvara odmah, a vi ste njen moderator.
          } @else {
            Urednik pregleda predlog i otvara temu. Moderator teme vodi razgovor i odobrava sažetak rasprave.
          }
        </p>
        <form class="admin-form" [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline">
            <mat-label>Tema</mat-label>
            <input matInput formControlName="title" maxlength="200" placeholder="npr. Da li sekcije treba da ulaze u normu?" />
            <mat-hint>Kratko, kao pitanje ili naslov.</mat-hint>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>O čemu bi kolege razgovarale</mat-label>
            <textarea matInput formControlName="description" rows="5" maxlength="3000"></textarea>
            <mat-hint>Zašto je tema važna i šta bi trebalo da se zaključi.</mat-hint>
          </mat-form-field>
        </form>
        @if (error(); as message) {
          <p class="form-error" role="alert">{{ message }}</p>
        }
      }
      <ng-container dialogActions>
        @if (sent()) {
          <button type="button" mat-flat-button [mat-dialog-close]="created()">Zatvori</button>
        } @else {
          <button type="button" mat-stroked-button mat-dialog-close>Odustani</button>
          <button type="button" mat-flat-button [disabled]="busy()" (click)="submit()">{{ staff ? 'Otvori temu' : 'Pošalji predlog' }}</button>
        }
      </ng-container>
    </app-dialog-shell>
  `,
})
export class ProposeTopicDialog {
  readonly #http = inject(HttpClient);
  readonly #ref = inject(MatDialogRef<ProposeTopicDialog, Debate | null>);

  protected readonly staff = inject(AuthService).isEditor();
  protected readonly form = inject(NonNullableFormBuilder).group({
    title: ['', [Validators.required, Validators.minLength(10)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
  });
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sent = signal<string | null>(null);
  protected readonly created = signal<Debate | null>(null);

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(this.form.controls.title.invalid ? 'Tema treba da ima bar 10 znakova.' : 'Opišite temu u bar jednoj rečenici.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.#http.post<Debate & { message: string }>(`${API_URL}/debates`, this.form.getRawValue()).subscribe({
      next: (debate) => {
        this.busy.set(false);
        if (debate.status === 'open') {
          this.#ref.close(debate);
          return;
        }
        this.created.set(debate);
        this.sent.set(debate.message);
      },
      error: (error) => {
        this.busy.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}

@Injectable({ providedIn: 'root' })
export class ProposeTopicDialogService {
  readonly #dialog = inject(MatDialog);

  open(): MatDialogRef<ProposeTopicDialog, Debate | null> {
    return this.#dialog.open<ProposeTopicDialog, void, Debate | null>(ProposeTopicDialog, { width: '640px', maxWidth: '100vw', panelClass: 'app-dialog-panel', autoFocus: false });
  }
}
