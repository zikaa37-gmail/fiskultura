import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { AuthService } from '../../core/auth/auth.service';
import { Organization } from '../../core/content/content.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';

const OTHER = 0;

@Component({
  selector: 'app-send-post',
  imports: [ReactiveFormsModule, RouterLink, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    form {
      display: grid;
      gap: 4px;
    }
  `,
  template: `
    <section class="section">
      <div class="container auth-wrap">
        <div class="auth-card">
          <p class="eyebrow">Udruženja</p>
          <h1 class="mb-3">Pošalji objavu</h1>
          <p class="muted mb-4">
            Vaše društvo ili savez organizuje seminar, takmičenje ili skupštinu? Pošaljite link na objavu (sajt, Facebook, Instagram) ili
            ukratko opišite o čemu je reč. Urednik napiše kratku vest svojim rečima i uvek stavi link na vaš izvor.
          </p>
          @if (sent(); as message) {
            <p role="status" class="mb-3">{{ message }}</p>
            <div class="found-cta-actions">
              <button type="button" mat-flat-button (click)="again()">Pošalji još jednu objavu</button>
              <a mat-stroked-button theme="tertiary" routerLink="/vesti">Vesti</a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="send()">
              <mat-form-field appearance="outline">
                <mat-label>Organizacija</mat-label>
                <mat-select formControlName="organization_id">
                  @for (organization of organizations(); track organization.id) {
                    <mat-option [value]="organization.id">{{ organization.name }}</mat-option>
                  }
                  <mat-option [value]="other">Nema je na spisku</mat-option>
                </mat-select>
              </mat-form-field>
              @if (isOther()) {
                <mat-form-field appearance="outline">
                  <mat-label>Naziv organizacije</mat-label>
                  <input matInput formControlName="sender_organization" maxlength="190" />
                </mat-form-field>
              }
              <mat-form-field appearance="outline">
                <mat-label>Naslov objave</mat-label>
                <input matInput formControlName="title" maxlength="250" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Link na objavu</mat-label>
                <input matInput formControlName="url" type="url" inputmode="url" maxlength="500" />
                <mat-hint>Ako objava nema link, opišite je ispod.</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Kratak opis (nije obavezno uz link)</mat-label>
                <textarea matInput formControlName="excerpt" rows="5" maxlength="3000"></textarea>
                <mat-hint>Šta, kada, gde i za koga.</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Vaše ime i prezime</mat-label>
                <input matInput formControlName="sender_name" autocomplete="name" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Mejl za pitanja urednika</mat-label>
                <input matInput formControlName="sender_email" type="email" autocomplete="email" />
              </mat-form-field>
              <input class="visually-hidden" tabindex="-1" autocomplete="off" aria-hidden="true" formControlName="website" />
              @if (error(); as message) {
                <p class="form-error" role="alert">{{ message }}</p>
              }
              <p class="small muted mb-3">Ime i mejl vidi samo uredništvo, da bi moglo da vam se javi.</p>
              <button type="submit" mat-flat-button [disabled]="busy()">Pošalji uredništvu</button>
            </form>
          }
        </div>
      </div>
    </section>
  `,
})
export class SendPost {
  readonly #http = inject(HttpClient);
  readonly #auth = inject(AuthService);

  protected readonly other = OTHER;
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sent = signal<string | null>(null);
  readonly #organizations = httpResource<Organization[]>(() => `${API_URL}/organizations`);
  protected readonly organizations = computed(() =>
    (this.#organizations.hasValue() ? this.#organizations.value() : [])
      .map((organization) => ({ id: organization.id, name: organization.short_name ? `${organization.short_name} (${organization.name})` : organization.name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'sr')),
  );
  protected readonly form = inject(NonNullableFormBuilder).group({
    organization_id: [null as number | null, Validators.required],
    sender_organization: [''],
    title: ['', [Validators.required, Validators.minLength(5)]],
    url: ['', Validators.pattern(/^https?:\/\/\S+$/)],
    excerpt: [''],
    sender_name: ['', [Validators.required, Validators.minLength(2)]],
    sender_email: ['', [Validators.required, Validators.email]],
    website: [''],
  });
  readonly #organizationId = toSignal(this.form.controls.organization_id.valueChanges, { initialValue: null });
  protected readonly isOther = computed(() => this.#organizationId() === OTHER);

  constructor() {
    effect(() => {
      const user = this.#auth.currentUser();
      if (user && !this.form.controls.sender_email.value) {
        this.form.patchValue({ sender_name: user.name, sender_email: user.email });
      }
    });
  }

  protected send(): void {
    const value = this.form.getRawValue();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(this.form.controls.url.invalid ? 'Link treba da počinje sa https://.' : 'Izaberite organizaciju i upišite naslov, ime i mejl.');
      return;
    }
    if (value.organization_id === OTHER && value.sender_organization.trim().length < 2) {
      this.error.set('Upišite naziv organizacije.');
      return;
    }
    if (!value.url.trim() && value.excerpt.trim().length < 20) {
      this.error.set('Pošaljite link na objavu ili je opišite u nekoliko rečenica.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    const payload = {
      ...value,
      organization_id: value.organization_id === OTHER ? null : value.organization_id,
      sender_organization: value.organization_id === OTHER ? value.sender_organization.trim() : null,
      url: value.url.trim() || null,
      excerpt: value.excerpt.trim() || null,
    };
    this.#http.post<{ message: string }>(`${API_URL}/news-suggestions`, payload).subscribe({
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
    this.form.patchValue({ title: '', url: '', excerpt: '' });
    this.form.markAsUntouched();
  }
}
