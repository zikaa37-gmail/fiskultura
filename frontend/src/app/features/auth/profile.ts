import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/auth/auth.service';
import { ROLE_LABELS } from '../../core/auth/user.model';
import { apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { DISTRICTS } from '../../content/districts';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container auth-wrap">
        @if (auth.currentUser(); as user) {
          <form class="auth-card" [formGroup]="profileForm" (ngSubmit)="saveProfile()">
            <span class="status status-next">{{ roleLabels[user.role] }}</span>
            <h1>Moj profil</h1>
            <p class="muted">{{ user.email }}</p>
            <mat-form-field appearance="outline">
              <mat-label>Ime i prezime</mat-label>
              <input matInput formControlName="name" autocomplete="name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Škola</mat-label>
              <input matInput formControlName="school" />
            </mat-form-field>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Opština / grad</mat-label>
                <input matInput formControlName="municipality" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Okrug</mat-label>
                <mat-select formControlName="district">
                  <mat-option value="">—</mat-option>
                  @for (district of districts; track district) {
                    <mat-option [value]="district">{{ district }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <button type="submit" mat-flat-button [disabled]="busy()">Sačuvaj</button>
          </form>

          <form class="auth-card" [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <h2>Promena lozinke</h2>
            <mat-form-field appearance="outline">
              <mat-label>Trenutna lozinka</mat-label>
              <input matInput type="password" formControlName="current" autocomplete="current-password" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nova lozinka</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="new-password" />
              <mat-hint>Najmanje 8 znakova</mat-hint>
            </mat-form-field>
            <button type="submit" mat-stroked-button [disabled]="busy()">Promeni lozinku</button>
          </form>

          <button type="button" mat-button (click)="auth.logout()">Odjavi se</button>
        }
      </div>
    </section>
  `,
})
export class Profile {
  protected readonly auth = inject(AuthService);
  readonly #notifications = inject(NotificationService);
  readonly #formBuilder = inject(NonNullableFormBuilder);

  protected readonly roleLabels = ROLE_LABELS;
  protected readonly districts = DISTRICTS;
  protected readonly busy = signal(false);

  protected readonly profileForm = this.#formBuilder.group({
    name: [this.auth.currentUser()?.name ?? '', Validators.required],
    school: [this.auth.currentUser()?.school ?? ''],
    municipality: [this.auth.currentUser()?.municipality ?? ''],
    district: [this.auth.currentUser()?.district ?? ''],
  });

  protected readonly passwordForm = this.#formBuilder.group({
    current: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const value = this.profileForm.getRawValue();
    this.busy.set(true);
    this.auth.updateProfile({ name: value.name, school: value.school || null, municipality: value.municipality || null, district: value.district || null }).subscribe({
      next: () => {
        this.#notifications.show('Profil je sačuvan.');
        this.busy.set(false);
      },
      error: (error) => {
        this.#notifications.show(apiErrorMessage(error));
        this.busy.set(false);
      },
    });
  }

  protected changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { current, password } = this.passwordForm.getRawValue();
    this.busy.set(true);
    this.auth.changePassword(current, password).subscribe({
      next: (response) => {
        this.#notifications.show(response.message);
        this.auth.clearSession();
      },
      error: (error) => {
        this.#notifications.show(apiErrorMessage(error));
        this.busy.set(false);
      },
    });
  }
}
