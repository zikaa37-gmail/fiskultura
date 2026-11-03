import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessage } from '../../core/http/api';
import { DISTRICTS } from '../../content/districts';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container auth-wrap">
        @if (sentMessage(); as message) {
          <div class="auth-card">
            <h1>Proveri mejl</h1>
            <p>{{ message }}</p>
            <p class="muted">Link stiže sa adrese obavestenja&#64;fiskultura.rs. Ako ga ne vidiš, pogledaj i folder za neželjenu poštu.</p>
            <a mat-stroked-button routerLink="/prijava">Na prijavu</a>
          </div>
        } @else {
          <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()">
            <h1>Napravi nalog</h1>
            <p class="muted">Besplatno, za nastavnike fizičkog, učitelje, trenere, roditelje i sve koje zanima fizičko vaspitanje i školski sport.</p>
            <mat-form-field appearance="outline">
              <mat-label>Ime i prezime</mat-label>
              <input matInput formControlName="name" autocomplete="name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Mejl</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Lozinka</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="new-password" />
              <mat-hint>Najmanje 8 znakova</mat-hint>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Škola (nije obavezno)</mat-label>
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
            @if (error(); as message) {
              <p class="form-error" role="alert">{{ message }}</p>
            }
            <button type="submit" mat-flat-button [disabled]="busy()">Napravi nalog</button>
            <div class="auth-links">
              <a class="inline-link" routerLink="/prijava">Već imam nalog</a>
            </div>
          </form>
        }
      </div>
    </section>
  `,
})
export class Register {
  readonly #auth = inject(AuthService);

  protected readonly districts = DISTRICTS;
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    school: [''],
    municipality: [''],
    district: [''],
  });
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sentMessage = signal<string | null>(null);

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.busy.set(true);
    this.error.set(null);
    this.#auth
      .register({
        ...value,
        password_confirmation: value.password,
        school: value.school || null,
        municipality: value.municipality || null,
        district: value.district || null,
      })
      .subscribe({
        next: (response) => this.sentMessage.set(response.message),
        error: (error) => {
          this.error.set(apiErrorMessage(error));
          this.busy.set(false);
        },
      });
  }
}
