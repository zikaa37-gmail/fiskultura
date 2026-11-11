import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { DebatePost } from './debate.model';

@Component({
  selector: 'app-ban-dialog',
  imports: [FormsModule, MatDialogModule, MatCheckboxModule, MatInputModule, MatSelectModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell title="Zabrana pisanja">
      <div class="ban-form">
        <p class="muted">
          <strong>{{ post.author }}</strong> neće moći da piše priloge i zahteve. Čitanje i reakcije ostaju. Korisnik dobija mejl i
          notifikaciju sa razlogom.
        </p>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Razlog (vidi ga korisnik)</mat-label>
          <textarea matInput rows="3" maxlength="500" [ngModel]="reason()" (ngModelChange)="reason.set($event)" placeholder="npr. Lični napad na kolegu; prilozi nisu o temi."></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Trajanje</mat-label>
          <mat-select [ngModel]="days()" (ngModelChange)="days.set($event)">
            <mat-option [value]="1">1 dan</mat-option>
            <mat-option [value]="7">7 dana</mat-option>
            <mat-option [value]="30">30 dana</mat-option>
            <mat-option [value]="null">Trajno (dok moderator ne ukine)</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Gde</mat-label>
          <mat-select [ngModel]="scope()" (ngModelChange)="scope.set($event)">
            <mat-option value="debate">Samo u ovoj temi</mat-option>
            <mat-option value="all">U svim stručnim debatama</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-checkbox [ngModel]="hidePost()" (ngModelChange)="hidePost.set($event)">Sakrij i ovaj prilog</mat-checkbox>
        @if (error(); as text) {
          <p class="form-error" role="alert">{{ text }}</p>
        }
      </div>
      <ng-container dialogActions>
        <button type="button" mat-stroked-button mat-dialog-close>Odustani</button>
        <button type="button" mat-flat-button theme="danger" [disabled]="busy() || reason().trim().length < 5" (click)="save()">Zabrani pisanje</button>
      </ng-container>
    </app-dialog-shell>
  `,
  styles: `
    .ban-form {
      display: grid;
      gap: 12px;
    }
    mat-form-field {
      width: 100%;
    }
  `,
})
export class BanDialog {
  readonly #http = inject(HttpClient);
  readonly #ref = inject(MatDialogRef<BanDialog, string>);
  protected readonly post = inject<DebatePost>(MAT_DIALOG_DATA);

  protected readonly reason = signal('');
  protected readonly days = signal<number | null>(7);
  protected readonly scope = signal<'debate' | 'all'>('debate');
  protected readonly hidePost = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected save(): void {
    this.busy.set(true);
    this.error.set(null);
    this.#http
      .post<{ message: string }>(`${API_URL}/debate-posts/${this.post.id}/ban`, { reason: this.reason().trim(), days: this.days(), scope: this.scope(), hide_post: this.hidePost() })
      .subscribe({
        next: (response) => this.#ref.close(response.message),
        error: (error) => {
          this.busy.set(false);
          this.error.set(apiErrorMessage(error));
        },
      });
  }
}
