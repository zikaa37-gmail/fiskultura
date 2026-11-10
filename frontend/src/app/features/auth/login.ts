import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container auth-wrap">
        <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()">
          <h1>Prijava</h1>
          <p class="muted">Prijavi se da pratiš vesti i udruženja i dobijaš obaveštenja.</p>
          <mat-form-field appearance="outline">
            <mat-label>Mejl</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Lozinka</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="current-password" />
          </mat-form-field>
          @if (error(); as message) {
            <p class="form-error" role="alert">{{ message }}</p>
          }
          @if (unverified()) {
            <button type="button" mat-button (click)="resend()">Pošalji ponovo link za potvrdu</button>
          }
          <button type="submit" mat-flat-button [disabled]="busy()">Prijavi se</button>
          <div class="auth-links">
            <a class="inline-link" routerLink="/zaboravljena-lozinka">Zaboravljena lozinka</a>
            <a class="inline-link" routerLink="/registracija">Napravi nalog</a>
          </div>
        </form>
      </div>
    </section>
  `,
})
export class Login {
  readonly povratak = input<string>();

  readonly #auth = inject(AuthService);
  readonly #router = inject(Router);
  readonly #notifications = inject(NotificationService);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly unverified = signal(false);

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.busy.set(true);
    this.error.set(null);
    this.#auth.login(email, password).subscribe({
      next: () => this.#router.navigateByUrl(this.povratak() || this.#auth.homeUrl()),
      error: (error) => {
        const message = apiErrorMessage(error);
        this.error.set(message);
        this.unverified.set(message.includes('potvrđena'));
        this.busy.set(false);
      },
    });
  }

  protected resend(): void {
    this.#auth.resendVerification(this.form.controls.email.value).subscribe({
      next: (response) => this.#notifications.show(response.message),
      error: (error) => this.#notifications.show(apiErrorMessage(error)),
    });
  }
}
