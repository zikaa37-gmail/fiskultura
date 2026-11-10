import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { AuthService } from '../../core/auth/auth.service';
import { formatDate } from '../../core/content/content.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { createQuestionForm, QuestionFields, questionPayload } from './question-fields';
import { LEGAL_DISCLAIMER, OwnQuestion, QUESTION_STATUS_LABELS } from './question.model';

@Component({
  selector: 'app-ask-question',
  imports: [ReactiveFormsModule, RouterLink, BUTTON_IMPORTS, QuestionFields],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    form {
      display: grid;
      gap: 4px;
      min-width: 0;
    }
    .own-list {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .own-list li {
      display: grid;
      gap: 2px;
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
    }
    .actions {
      display: grid;
      gap: 8px;
    }
  `,
  template: `
    <section class="section">
      <div class="container auth-wrap">
        <div class="auth-card">
          <a class="inline-link small" routerLink="/pitanja">← Sva pitanja</a>
          <h1>Postavi pitanje</h1>
          @if (!auth.isAuthenticated()) {
            <p>Pitanja šalju prijavljeni korisnici, da bismo vam javili kad odgovor bude objavljen.</p>
            <div class="actions">
              <a mat-flat-button routerLink="/prijava">Prijavi se</a>
              <a mat-stroked-button routerLink="/registracija">Napravi nalog</a>
            </div>
          } @else if (sentMessage(); as message) {
            <p role="status">{{ message }}</p>
            <div class="actions">
              <button type="button" mat-stroked-button (click)="askAnother()">Postavi još jedno</button>
              <a mat-button routerLink="/pitanja">Na pitanja</a>
            </div>
          } @else {
            <p class="muted">Urednik odgovara uz poziv na propis i objavljuje odgovor <strong>bez vašeg imena i škole</strong>, da pomogne i drugim kolegama. Javićemo vam mejlom kad odgovor bude objavljen.</p>
            <form [formGroup]="form" (ngSubmit)="submit()">
              <app-question-fields [form]="form" />
              @if (error(); as message) {
                <p class="form-error" role="alert">{{ message }}</p>
              }
              <button type="submit" mat-flat-button [disabled]="busy()">Pošalji pitanje</button>
            </form>
          }
          <p class="muted small">{{ disclaimer }}</p>
        </div>

        @if (auth.isAuthenticated() && ownQuestions().length) {
          <div class="auth-card">
            <h2>Moja pitanja</h2>
            <ul class="own-list">
              @for (item of ownQuestions(); track item.id) {
                <li>
                  @if (item.slug) {
                    <a [routerLink]="['/pitanja', item.slug]">{{ item.title }}</a>
                  } @else {
                    <strong>{{ item.title }}</strong>
                  }
                  <span class="muted small">{{ statusLabels[item.status] }}{{ item.created_at ? ' · poslato ' + date(item.created_at) : '' }}</span>
                </li>
              }
            </ul>
          </div>
        }
      </div>
    </section>
  `,
})
export class AskQuestion {
  protected readonly auth = inject(AuthService);
  readonly #http = inject(HttpClient);

  protected readonly disclaimer = LEGAL_DISCLAIMER;
  protected readonly statusLabels = QUESTION_STATUS_LABELS;

  protected readonly form = createQuestionForm(inject(NonNullableFormBuilder));

  readonly #own = httpResource<OwnQuestion[]>(() => (this.auth.isAuthenticated() ? `${API_URL}/me/questions` : undefined));
  protected readonly ownQuestions = computed(() => (this.#own.hasValue() ? this.#own.value() : []));
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sentMessage = signal<string | null>(null);

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(this.form.controls.title.invalid ? 'Pitanje ukratko treba da ima bar 10 znakova.' : null);
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.#http.post<{ message: string }>(`${API_URL}/questions`, questionPayload(this.form)).subscribe({
      next: (response) => {
        this.sentMessage.set(response.message);
        this.busy.set(false);
        this.#own.reload();
      },
      error: (error) => {
        this.error.set(apiErrorMessage(error));
        this.busy.set(false);
      },
    });
  }

  protected askAnother(): void {
    this.form.reset();
    this.sentMessage.set(null);
  }

  protected date(value: string): string {
    return formatDate(value);
  }
}
