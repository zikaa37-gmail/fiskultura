import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessage } from '../../core/http/api';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container auth-wrap">
        <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()">
          <h1>Zaboravljena lozinka</h1>
          @if (sentMessage(); as message) {
            <p>{{ message }}</p>
            <a mat-stroked-button routerLink="/prijava" [queryParams]="{ email: form.controls.email.value || null }">Na prijavu</a>
          } @else {
            <p class="muted">Upiši mejl naloga i poslaćemo ti link za novu lozinku.</p>
            <mat-form-field appearance="outline">
              <mat-label>Mejl</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
            </mat-form-field>
            @if (error(); as message) {
              <p class="form-error" role="alert">{{ message }}</p>
            }
            <button type="submit" mat-flat-button [disabled]="busy()">Pošalji link</button>
          }
        </form>
      </div>
    </section>
  `,
})
export class ForgotPassword {
  readonly email = input<string>();

  readonly #auth = inject(AuthService);

  protected readonly form = inject(NonNullableFormBuilder).group({ email: ['', [Validators.required, Validators.email]] });
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sentMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const email = this.email();
      if (email && !this.form.controls.email.value) {
        this.form.controls.email.setValue(email);
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.#auth.forgotPassword(this.form.controls.email.value).subscribe({
      next: (response) => this.sentMessage.set(response.message),
      error: (error) => {
        this.error.set(apiErrorMessage(error));
        this.busy.set(false);
      },
    });
  }
}
