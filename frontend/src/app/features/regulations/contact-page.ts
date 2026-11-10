import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/auth/auth.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { CONTACT_TOPICS, ContactTopic, EDITORIAL_TEAM } from '../../content/rules/contacts';

@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule, RouterLink, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container contact-page">
        <div class="section-head">
          <p class="eyebrow">Kontakt</p>
          <h1>Ko pravi Fiskulturu</h1>
          <p class="muted">
            Portal pravimo nastavnici i za nastavnike fizičkog i zdravstvenog vaspitanja. Pišite nam kad nešto nije tačno ili je zastarelo,
            kad imate pitanje ili predlog, ili kad želite da sarađujemo. Odgovaramo na mejl koji navedete.
          </p>
        </div>

        <div class="editorial-team">
          @for (member of team; track member.name) {
            <article class="contact-card">
              <h2>{{ member.name }}</h2>
              <p class="small rule-now-label">{{ member.role }}</p>
              <p class="small">{{ member.about }}</p>
              @if (member.url) {
                <a class="inline-link small" [href]="member.url">Više o autoru</a>
              }
            </article>
          }
        </div>

        <div class="auth-card contact-form-card">
          <h2>Piši uredništvu</h2>
          @if (sent()) {
            <p role="status">{{ sent() }}</p>
            <button type="button" mat-stroked-button (click)="again()">Pošalji još jednu poruku</button>
          } @else {
            <form [formGroup]="form" (ngSubmit)="send()">
              <mat-form-field appearance="outline">
                <mat-label>Tema</mat-label>
                <mat-select formControlName="topic">
                  @for (option of topics; track option.id) {
                    <mat-option [value]="option.id">{{ option.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Ime i prezime</mat-label>
                <input matInput formControlName="name" autocomplete="name" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Mejl za odgovor</mat-label>
                <input matInput formControlName="email" type="email" autocomplete="email" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Poruka</mat-label>
                <textarea matInput formControlName="message" rows="7"></textarea>
                <mat-hint>Ako pišete o propisu ili stranici, navedite koju.</mat-hint>
              </mat-form-field>
              <input class="visually-hidden" tabindex="-1" autocomplete="off" aria-hidden="true" formControlName="website" />
              @if (error()) {
                <p class="form-error" role="alert">{{ error() }}</p>
              }
              <button type="submit" mat-flat-button [disabled]="busy()">Pošalji poruku</button>
            </form>
          }
          <p class="small muted">
            Mejl i ime koristimo samo da vam odgovorimo. Za pitanja o propisima koja mogu pomoći i drugima postoji
            <a class="inline-link" routerLink="/pitanja">Pitanja i odgovori</a>; kontakti institucija su na stranici
            <a class="inline-link" routerLink="/propisi" [queryParams]="{ tab: 'kontakti' }">Propisi → Kontakti</a>.
          </p>
        </div>
      </div>
    </section>
  `,
})
export class ContactPage {
  readonly tema = input<string>();

  readonly #http = inject(HttpClient);
  readonly #auth = inject(AuthService);

  protected readonly team = EDITORIAL_TEAM;
  protected readonly topics = CONTACT_TOPICS;
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sent = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    topic: ['pitanje' as ContactTopic, Validators.required],
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
    website: [''],
  });

  constructor() {
    effect(() => {
      const topic = CONTACT_TOPICS.find((item) => item.id === this.tema());
      if (topic) {
        this.form.controls.topic.setValue(topic.id);
      }
    });
    effect(() => {
      const user = this.#auth.currentUser();
      if (user && !this.form.controls.email.value) {
        this.form.patchValue({ name: user.name, email: user.email });
      }
    });
  }

  protected send(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.#http.post<{ message: string }>(`${API_URL}/contact`, this.form.getRawValue()).subscribe({
      next: (response) => {
        this.busy.set(false);
        this.sent.set(response.message);
        this.form.controls.message.reset('');
      },
      error: (error) => {
        this.busy.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }

  protected again(): void {
    this.sent.set(null);
  }
}
