import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MEMBER_STATUS_LABELS, MemberStatus } from '../../core/auth/user.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { DISTRICTS } from '../../content/districts';
import { formatPhone, isValidPhone } from '../../core/phone';
import { PhoneField } from '../../shared/phone-field/phone-field';

interface Invitation {
  name: string;
  email: string;
  phone: string | null;
  member_status: MemberStatus | null;
  school: string | null;
  municipality: string | null;
  district: string | null;
}

@Component({
  selector: 'app-complete-registration',
  imports: [FormsModule, RouterLink, BUTTON_IMPORTS, MatCheckboxModule, FORM_FIELD_IMPORTS, MatInputModule, MatSelectModule, PhoneField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container auth-wrap">
        <form class="auth-card" (ngSubmit)="submit()">
          <h1>Završetak registracije</h1>
          @if (doneMessage(); as message) {
            <p>{{ message }}</p>
            <a mat-flat-button routerLink="/prijava">Prijavi se</a>
          } @else if (invitation(); as data) {
            <p>Dobro došli, {{ data.name }}. Proverite podatke za nalog <strong>{{ data.email }}</strong> i postavite lozinku.</p>
            <mat-form-field appearance="outline">
              <mat-label>Ime i prezime</mat-label>
              <input matInput name="name" required maxlength="120" autocomplete="name" [ngModel]="name()" (ngModelChange)="name.set($event)" />
            </mat-form-field>
            <app-phone-field class="mb-4" label="Telefon (nije obavezno)" [(value)]="phone" />
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select name="member_status" [ngModel]="memberStatus()" (ngModelChange)="memberStatus.set($event)">
                @for (option of statuses; track option) {
                  <mat-option [value]="option">{{ statusLabels[option] }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Škola</mat-label>
              <input matInput name="school" maxlength="190" [ngModel]="school()" (ngModelChange)="school.set($event)" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Opština</mat-label>
              <input matInput name="municipality" maxlength="120" [ngModel]="municipality()" (ngModelChange)="municipality.set($event)" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Okrug</mat-label>
              <mat-select name="district" [ngModel]="district()" (ngModelChange)="district.set($event)">
                @for (option of districts; track option) {
                  <mat-option [value]="option">{{ option }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Lozinka</mat-label>
              <input matInput name="password" type="password" required minlength="8" autocomplete="new-password" [ngModel]="password()" (ngModelChange)="password.set($event)" />
              <mat-hint>Najmanje 8 znakova</mat-hint>
            </mat-form-field>
            <mat-checkbox name="directory_consent" [ngModel]="directoryConsent()" (ngModelChange)="directoryConsent.set($event)">Prikaži me u imeniku članova</mat-checkbox>
            <mat-checkbox name="surveys_consent" [ngModel]="surveysConsent()" (ngModelChange)="surveysConsent.set($event)">Povremeno me pozovite na stručne ankete</mat-checkbox>
            @if (error(); as message) {
              <p class="form-error" role="alert">{{ message }}</p>
            }
            <button type="submit" mat-flat-button [disabled]="busy() || !name().trim() || password().length < 8">Završi registraciju</button>
          } @else if (invalid()) {
            <p class="form-error" role="alert">Poziv je istekao ili je već iskorišćen. Zatražite novi od uredništva ili se prijavite ako već imate lozinku.</p>
            <a mat-flat-button routerLink="/prijava">Prijava</a>
          } @else {
            <p class="muted">Učitavanje poziva…</p>
          }
        </form>
      </div>
    </section>
  `,
})
export class CompleteRegistration {
  readonly token = input<string>();

  readonly #http = inject(HttpClient);

  protected readonly statuses = Object.keys(MEMBER_STATUS_LABELS) as MemberStatus[];
  protected readonly statusLabels = MEMBER_STATUS_LABELS;
  protected readonly districts = DISTRICTS;

  protected readonly resource = httpResource<Invitation>(() => {
    const token = this.token();
    return token ? { url: `${API_URL}/auth/invitation`, method: 'POST', body: { token } } : undefined;
  });
  protected readonly invitation = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  protected readonly invalid = computed(() => !this.token() || this.resource.status() === 'error');

  protected readonly name = linkedSignal(() => this.invitation()?.name ?? '');
  protected readonly phone = linkedSignal(() => this.invitation()?.phone ?? '');
  protected readonly memberStatus = linkedSignal<MemberStatus | null>(() => this.invitation()?.member_status ?? null);
  protected readonly school = linkedSignal(() => this.invitation()?.school ?? '');
  protected readonly municipality = linkedSignal(() => this.invitation()?.municipality ?? '');
  protected readonly district = linkedSignal<string | null>(() => this.invitation()?.district ?? null);
  protected readonly password = signal('');
  protected readonly directoryConsent = signal(true);
  protected readonly surveysConsent = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly doneMessage = signal<string | null>(null);

  protected submit(): void {
    if (this.busy() || !this.name().trim() || this.password().length < 8 || !isValidPhone(this.phone())) {
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.#http
      .post<{ message: string }>(`${API_URL}/auth/invitation/complete`, {
        token: this.token(),
        name: this.name().trim(),
        phone: formatPhone(this.phone()),
        member_status: this.memberStatus(),
        school: this.school().trim() || null,
        municipality: this.municipality().trim() || null,
        district: this.district(),
        password: this.password(),
        password_confirmation: this.password(),
        directory_consent: this.directoryConsent(),
        surveys_consent: this.surveysConsent(),
      })
      .subscribe({
        next: (response) => this.doneMessage.set(response.message),
        error: (error) => {
          this.error.set(apiErrorMessage(error));
          this.busy.set(false);
        },
      });
  }
}
