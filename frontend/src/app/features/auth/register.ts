import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/auth/auth.service';
import { MEMBER_STATUS_LABELS, MEMBER_STATUSES, MemberStatus } from '../../core/auth/user.model';
import { apiErrorMessage } from '../../core/http/api';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container auth-wrap">
        @if (sentMessage(); as message) {
          <div class="auth-card">
            <h1>Proveri mejl</h1>
            <p>{{ message }}</p>
            <p class="muted">
              Link stiže sa adrese obavestenja&#64;fiskultura.rs. Ako ga ne vidiš, pogledaj i folder za neželjenu poštu.
              Kad klikneš na link, odmah si prijavljen i ostaješ prijavljen na tom uređaju.
            </p>
            <a mat-stroked-button routerLink="/prijava">Na prijavu</a>
          </div>
        } @else {
          <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()">
            <h1>Pridruži se struci</h1>
            <p class="muted">
              Vesti i udruženja su javni. Nalog je besplatan i otvara propise, pitanja i odgovore, pravila sportova sa PDF uputstvima, obaveštenja po izboru,
              pitanja uredništvu, imenik kolega i glas struke u anketama.
            </p>
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
              <mat-label>Ja sam</mat-label>
              <mat-select formControlName="member_status">
                @for (status of statuses; track status) {
                  <mat-option [value]="status">{{ statusLabels[status] }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <p class="small muted">Školu, opštinu i okrug možeš da dodaš kasnije u profilu.</p>
            <mat-checkbox formControlName="directory_consent">
              Prikaži me u imeniku struke
              <span class="small muted consent-note">Ime, status, škola, opština i okrug, samo članovima koji su i sami u imeniku. Mejl se ne prikazuje.</span>
            </mat-checkbox>
            <mat-checkbox formControlName="surveys_consent">
              Pozivaj me na ankete i inicijative struke
              <span class="small muted consent-note">Povremeni mejl kad struka treba da kaže svoje mišljenje. Obe saglasnosti menjaš u profilu kad hoćeš.</span>
            </mat-checkbox>
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

  protected readonly statuses = MEMBER_STATUSES;
  protected readonly statusLabels = MEMBER_STATUS_LABELS;
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    member_status: ['' as MemberStatus | '', Validators.required],
    directory_consent: [true],
    surveys_consent: [true],
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
        name: value.name,
        email: value.email,
        password: value.password,
        password_confirmation: value.password,
        member_status: value.member_status || null,
        directory_consent: value.directory_consent,
        surveys_consent: value.surveys_consent,
        source: this.#auth.source(),
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
