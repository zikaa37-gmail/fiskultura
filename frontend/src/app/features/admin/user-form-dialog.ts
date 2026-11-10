import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MEMBER_STATUS_LABELS, MemberStatus, ROLE_LABELS, UserRole } from '../../core/auth/user.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { DISTRICTS } from '../../content/districts';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { PhoneField } from '../../shared/phone-field/phone-field';
import { formatPhone, isValidPhone } from '../../core/phone';
import { AdminUser } from './admin.model';

@Component({
  selector: 'app-user-form-dialog',
  imports: [FormsModule, MatDialogModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatSelectModule, DialogShell, PhoneField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .user-form {
      display: grid;
      gap: 16px;
      padding-top: 4px;
    }
    mat-form-field {
      width: 100%;
    }
  `,
  template: `
    <app-dialog-shell [title]="user ? 'Izmena korisnika' : 'Novi korisnik'">
      <div class="user-form">
        @if (!user) {
          <p class="muted small">Korisnik dobija lični poziv mejlom da završi registraciju.</p>
        }
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Ime i prezime</mat-label>
          <input matInput cdkFocusInitial maxlength="120" [ngModel]="name()" (ngModelChange)="name.set($event)" />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Mejl</mat-label>
          <input matInput type="email" maxlength="190" [ngModel]="email()" (ngModelChange)="email.set($event)" />
        </mat-form-field>
        <app-phone-field [(value)]="phone" />
        @if (!user) {
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Uloga</mat-label>
            <mat-select [value]="role()" (selectionChange)="role.set($event.value)">
              @for (option of roles; track option) {
                <mat-option [value]="option">{{ roleLabels[option] }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Status</mat-label>
          <mat-select [value]="memberStatus()" (selectionChange)="memberStatus.set($event.value)">
            <mat-option value="">Nije navedeno</mat-option>
            @for (option of statuses; track option) {
              <mat-option [value]="option">{{ statusLabels[option] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Škola</mat-label>
          <input matInput maxlength="190" [ngModel]="school()" (ngModelChange)="school.set($event)" />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Opština</mat-label>
          <input matInput maxlength="120" [ngModel]="municipality()" (ngModelChange)="municipality.set($event)" />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Okrug</mat-label>
          <mat-select [value]="district()" (selectionChange)="district.set($event.value)">
            <mat-option value="">Nije navedeno</mat-option>
            @for (option of districts; track option) {
              <mat-option [value]="option">{{ option }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        @if (needsPassword()) {
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Tvoja lozinka (potvrda za ovu ulogu)</mat-label>
            <input matInput type="password" autocomplete="current-password" [ngModel]="adminPassword()" (ngModelChange)="adminPassword.set($event)" />
          </mat-form-field>
        }
        @if (error(); as message) {
          <p class="danger-text small" role="alert">{{ message }}</p>
        }
      </div>
      <ng-container dialogActions>
        <button type="button" mat-button [mat-dialog-close]="false">Otkaži</button>
        <button type="button" mat-flat-button [disabled]="!canSave()" (click)="save()">{{ user ? 'Sačuvaj' : 'Dodaj' }}</button>
      </ng-container>
    </app-dialog-shell>
  `,
})
export class UserFormDialog {
  readonly #http = inject(HttpClient);
  readonly #dialogRef = inject<MatDialogRef<UserFormDialog, boolean>>(MatDialogRef);

  protected readonly user = inject<AdminUser | null>(MAT_DIALOG_DATA);
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly roles = Object.keys(ROLE_LABELS) as UserRole[];
  protected readonly statuses = Object.keys(MEMBER_STATUS_LABELS) as MemberStatus[];
  protected readonly statusLabels = MEMBER_STATUS_LABELS;
  protected readonly districts = DISTRICTS;

  protected readonly name = signal(this.user?.name ?? '');
  protected readonly email = signal(this.user?.email ?? '');
  protected readonly phone = signal(this.user?.phone ?? '');
  protected readonly role = signal<UserRole>('user');
  protected readonly memberStatus = signal<MemberStatus | ''>(this.user?.member_status ?? '');
  protected readonly school = signal(this.user?.school ?? '');
  protected readonly municipality = signal(this.user?.municipality ?? '');
  protected readonly district = signal(this.user?.district ?? '');
  protected readonly adminPassword = signal('');
  protected readonly error = signal('');
  protected readonly saving = signal(false);

  protected readonly needsPassword = computed(() => !this.user && (this.role() === 'editor' || this.role() === 'admin'));
  protected readonly canSave = computed(() => !this.saving() && !!this.name().trim() && !!this.email().trim() && isValidPhone(this.phone()) && (!this.needsPassword() || !!this.adminPassword()));

  protected save(): void {
    if (!this.canSave()) {
      return;
    }
    const profile = {
      name: this.name().trim(),
      email: this.email().trim(),
      phone: formatPhone(this.phone()),
      member_status: this.memberStatus() || null,
      school: this.school().trim() || null,
      municipality: this.municipality().trim() || null,
      district: this.district() || null,
    };
    const request = this.user
      ? this.#http.patch<AdminUser>(`${API_URL}/admin/users/${this.user.id}`, profile)
      : this.#http.post<AdminUser>(`${API_URL}/admin/users`, { ...profile, role: this.role(), password: this.adminPassword() || null });
    this.saving.set(true);
    this.error.set('');
    request.subscribe({
      next: () => this.#dialogRef.close(true),
      error: (error) => {
        this.saving.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}
