import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { ROLE_LABELS, UserRole } from '../../core/auth/user.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { AdminUser } from './admin.model';

const ROLES = Object.keys(ROLE_LABELS) as UserRole[];

export function roleNeedsPassword(current: UserRole, next: UserRole): boolean {
  return (next === 'editor' || next === 'admin') && ROLES.indexOf(next) > ROLES.indexOf(current);
}

@Component({
  selector: 'app-role-dialog',
  imports: [FormsModule, MatDialogModule, BUTTON_IMPORTS, MatButtonToggleModule, FORM_FIELD_IMPORTS, MatInputModule, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .role-toggle {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
    }
    .role-toggle .mat-button-toggle {
      flex: 1 1 40%;
      min-height: 44px;
    }
    mat-form-field {
      width: 100%;
    }
    @media (min-width: 480px) {
      .role-toggle .mat-button-toggle {
        flex-basis: 0;
      }
    }
  `,
  template: `
    <app-dialog-shell [title]="'Uloga: ' + user.name">
      <mat-button-toggle-group class="role-toggle mb-3" hideSingleSelectionIndicator [value]="role()" (change)="role.set($event.value); error.set('')" aria-label="Uloga">
        @for (option of roles; track option) {
          <mat-button-toggle [value]="option">{{ roleLabels[option] }}</mat-button-toggle>
        }
      </mat-button-toggle-group>
      <p class="muted small mb-4">{{ descriptions[role()] }}</p>
      @if (needsPassword()) {
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Tvoja lozinka (potvrda za veći pristup)</mat-label>
          <input
            matInput
            type="password"
            autocomplete="current-password"
            [ngModel]="password()"
            (ngModelChange)="password.set($event); error.set('')"
            (keydown.enter)="submit()"
          />
        </mat-form-field>
      }
      @if (error(); as message) {
        <p class="danger-text small" role="alert">{{ message }}</p>
      }
      <ng-container dialogActions>
        <button type="button" mat-button [mat-dialog-close]="false">Otkaži</button>
        <button type="button" mat-flat-button [disabled]="!canSave()" (click)="submit()">Sačuvaj</button>
      </ng-container>
    </app-dialog-shell>
  `,
})
export class RoleDialog {
  readonly #http = inject(HttpClient);
  readonly #dialogRef = inject<MatDialogRef<RoleDialog, UserRole | null>>(MatDialogRef);

  protected readonly user = inject<AdminUser>(MAT_DIALOG_DATA);
  protected readonly roles = ROLES;
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly descriptions: Record<UserRole, string> = {
    user: 'Čita sadržaj za članove, prima obaveštenja i postavlja pitanja.',
    author: 'Može i da piše vesti; objavljuje ih urednik.',
    editor: 'Uređuje i objavljuje vesti, propise, pitanja i udruženja.',
    admin: 'Sve, uključujući korisnike i uloge.',
  };
  protected readonly role = signal<UserRole>(this.user.role);
  protected readonly password = signal('');
  protected readonly error = signal('');
  protected readonly saving = signal(false);

  protected readonly needsPassword = computed(() => roleNeedsPassword(this.user.role, this.role()));
  protected readonly canSave = computed(() => !this.saving() && this.role() !== this.user.role && (!this.needsPassword() || !!this.password()));

  protected submit(): void {
    if (!this.canSave()) {
      return;
    }
    this.saving.set(true);
    const body = this.needsPassword() ? { role: this.role(), password: this.password() } : { role: this.role() };
    this.#http.patch<AdminUser>(`${API_URL}/admin/users/${this.user.id}`, body).subscribe({
      next: () => this.#dialogRef.close(this.role()),
      error: (error) => {
        this.saving.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}
