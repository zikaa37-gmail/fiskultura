import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { DISTRICTS } from '../../content/districts';
import { AuthService } from '../../core/auth/auth.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';

@Component({
  selector: 'app-founding-interest-form',
  imports: [ReactiveFormsModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatSelectModule, MatCheckboxModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    form {
      display: grid;
      gap: 4px;
    }

    .consent {
      margin-bottom: 12px;
    }
  `,
  template: `
    <div class="auth-card">
      <h2 class="mb-2">Zainteresovan sam za društvo u svom mestu</h2>
      <p class="small muted mb-4">
        Kada se iz istog mesta prijave bar tri kolege, javljamo svima i savezu SSPFVS, uz imena i mejlove, da možete da se dogovorite
        oko osnivačke skupštine.
      </p>
      @if (sent(); as message) {
        <p role="status" class="mb-3">{{ message }}</p>
        <button type="button" mat-stroked-button theme="tertiary" (click)="again()">Prijavi još jedno mesto</button>
      } @else {
        <form [formGroup]="form" (ngSubmit)="send()">
          <mat-form-field appearance="outline">
            <mat-label>Okrug</mat-label>
            <mat-select formControlName="district">
              @for (district of districts; track district) {
                <mat-option [value]="district">{{ district }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Mesto (grad ili opština)</mat-label>
            <input matInput formControlName="city" autocomplete="address-level2" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Ime i prezime</mat-label>
            <input matInput formControlName="name" autocomplete="name" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Mejl</mat-label>
            <input matInput formControlName="email" type="email" autocomplete="email" />
            <mat-hint>Na njega stiže link za potvrdu.</mat-hint>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Škola (nije obavezno)</mat-label>
            <input matInput formControlName="school" autocomplete="organization" />
          </mat-form-field>
          <mat-checkbox class="consent" formControlName="consent">
            Saglasan sam da kolege iz istog mesta i SSPFVS dobiju moje ime, mejl i školu.
          </mat-checkbox>
          @if (error(); as message) {
            <p class="form-error" role="alert">{{ message }}</p>
          }
          <button type="submit" mat-flat-button [disabled]="busy()">Prijavi interesovanje</button>
        </form>
      }
    </div>
  `,
})
export class FoundingInterestForm {
  readonly #http = inject(HttpClient);
  readonly #auth = inject(AuthService);

  protected readonly districts = DISTRICTS;
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sent = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    district: ['', Validators.required],
    city: ['', [Validators.required, Validators.minLength(2)]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    school: [''],
    consent: [false, Validators.requiredTrue],
  });

  constructor() {
    effect(() => {
      const user = this.#auth.currentUser();
      if (user && !this.form.controls.email.value) {
        this.form.patchValue({ name: user.name, email: user.email, school: user.school ?? '', district: user.district ?? '', city: user.municipality ?? '' });
      }
    });
  }

  protected send(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(this.form.controls.consent.invalid ? 'Potrebna je saglasnost da kolege i SSPFVS dobiju vaše podatke.' : 'Popunite okrug, mesto, ime i mejl.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.#http.post<{ message: string }>(`${API_URL}/founding-interests`, this.form.getRawValue()).subscribe({
      next: (response) => {
        this.sent.set(response.message);
        this.busy.set(false);
      },
      error: (error) => {
        this.error.set(apiErrorMessage(error));
        this.busy.set(false);
      },
    });
  }

  protected again(): void {
    this.sent.set(null);
    this.form.patchValue({ city: '', district: '', consent: false });
  }
}
