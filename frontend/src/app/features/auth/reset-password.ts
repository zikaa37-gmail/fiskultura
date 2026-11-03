import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessage } from '../../core/http/api';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container auth-wrap">
        <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()">
          <h1>Nova lozinka</h1>
          @if (doneMessage(); as message) {
            <p>{{ message }}</p>
            <a mat-flat-button routerLink="/prijava">Prijavi se</a>
          } @else {
            <mat-form-field appearance="outline">
              <mat-label>Nova lozinka</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="new-password" />
              <mat-hint>Najmanje 8 znakova</mat-hint>
            </mat-form-field>
            @if (error(); as message) {
              <p class="form-error" role="alert">{{ message }}</p>
            }
            <button type="submit" mat-flat-button [disabled]="busy() || !token()">Sačuvaj lozinku</button>
          }
        </form>
      </div>
    </section>
  `,
})
export class ResetPassword {
  readonly token = input<string>();

  readonly #auth = inject(AuthService);

  protected readonly form = inject(NonNullableFormBuilder).group({ password: ['', [Validators.required, Validators.minLength(8)]] });
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly doneMessage = signal<string | null>(null);

  protected submit(): void {
    const token = this.token();
    if (this.form.invalid || !token) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.#auth.resetPassword(token, this.form.controls.password.value).subscribe({
      next: (response) => this.doneMessage.set(response.message),
      error: (error) => {
        this.error.set(apiErrorMessage(error));
        this.busy.set(false);
      },
    });
  }
}
