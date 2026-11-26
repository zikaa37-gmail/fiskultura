import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { AuthService } from '../../core/auth/auth.service';
import { formatDate } from '../../core/content/content.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';

interface AuthorRequest {
  is_author: boolean;
  requested_at: string | null;
  byline: string | null;
  bio: string | null;
  note: string | null;
  message?: string;
}

@Component({
  selector: 'app-author-request-dialog',
  imports: [ReactiveFormsModule, RouterLink, MatDialogModule, MatInputModule, MatProgressBarModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="auth.isAuthenticated() ? 'Prijava za autora' : 'Želiš da pišeš?'">
      @if (current.isLoading()) {
        <mat-progress-bar mode="indeterminate" />
      }
      @if (!auth.isAuthenticated()) {
        <p class="mb-3">Drago nam je što želiš da pišeš! Tekstovi na Fiskulturi su potpisani imenom i prezimenom, zato je za pisanje potreban nalog.</p>
        <ol class="write-steps mb-3">
          <li><strong>Napravi nalog</strong> (besplatno, minut posla) i potvrdi mejl. Ako ga već imaš, samo se prijavi.</li>
          <li><strong>Pošalji prijavu za autora:</strong> potpis (zvanje, specijalnost, mesto) i o čemu bi pisao.</li>
          <li><strong>Piši:</strong> kad ti uredništvo dodeli ulogu autora, tekst nalepiš u formu i šalješ na pregled pre objave.</li>
        </ol>
        <p class="small muted">Posle prijave te vraćamo ovde da popuniš prijavu za autora.</p>
      } @else if (sent(); as message) {
        <p class="mb-3" role="status">{{ message }}</p>
      } @else {
        <p class="muted mb-3">
          Tekstovi na Fiskulturi su potpisani imenom i prezimenom, bez anonimnih autora. Napiši ukratko ko si i o čemu bi pisao: urednik ti
          dodeljuje ulogu autora, a ti onda tekst nalepiš u formu i šalješ na pregled pre objave.
        </p>
        @if (requestedAt(); as date) {
          <p class="state-chip mb-3">Prijava poslata {{ date }}. Možeš da je dopuniš.</p>
        }
        <form class="admin-form" [formGroup]="form" (ngSubmit)="send()">
          <mat-form-field subscriptSizing="dynamic" appearance="outline">
            <mat-label>Potpis</mat-label>
            <input matInput formControlName="byline" maxlength="160" />
            <mat-hint>Zvanje ili specijalnost i mesto, npr. „profesor FV, instruktor skijanja, Kopaonik”.</mat-hint>
          </mat-form-field>
          <mat-form-field subscriptSizing="dynamic" appearance="outline">
            <mat-label>O čemu bi pisao</mat-label>
            <textarea matInput formControlName="note" rows="4" maxlength="2000"></textarea>
            <mat-hint>Tema, iskustvo, gde radiš: vojska, policija, GSS, ski centar, klub...</mat-hint>
          </mat-form-field>
          <mat-form-field subscriptSizing="dynamic" appearance="outline">
            <mat-label>Kratka biografija (nije obavezno)</mat-label>
            <textarea matInput formControlName="bio" rows="3" maxlength="1000"></textarea>
            <mat-hint>Prikazuje se ispod tvojih tekstova.</mat-hint>
          </mat-form-field>
          @if (error(); as message) {
            <p class="form-error" role="alert">{{ message }}</p>
          }
        </form>
      }
      <ng-container dialogActions>
        @if (!auth.isAuthenticated()) {
          <a mat-stroked-button mat-dialog-close routerLink="/prijava" [queryParams]="{ povratak: returnUrl }">Prijavi se</a>
          <a mat-flat-button mat-dialog-close routerLink="/registracija">Napravi nalog</a>
        } @else if (sent()) {
          <button type="button" mat-flat-button mat-dialog-close>U redu</button>
        } @else {
          <button type="button" mat-button mat-dialog-close>Otkaži</button>
          <button type="button" mat-flat-button [disabled]="busy()" (click)="send()">{{ requestedAt() ? 'Sačuvaj dopunu' : 'Pošalji prijavu' }}</button>
        }
      </ng-container>
    </app-dialog-shell>
  `,
})
export class AuthorRequestDialog {
  readonly #http = inject(HttpClient);

  protected readonly auth = inject(AuthService);
  protected readonly returnUrl = '/tekstovi?pisem=1';
  protected readonly current = httpResource<AuthorRequest>(() => (this.auth.isAuthenticated() ? `${API_URL}/author-request` : undefined));
  protected readonly requestedAt = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sent = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    byline: ['', [Validators.required, Validators.minLength(3)]],
    note: ['', [Validators.required, Validators.minLength(10)]],
    bio: [''],
  });

  constructor() {
    effect(() => {
      if (!this.current.hasValue()) {
        return;
      }
      const value = this.current.value();
      this.requestedAt.set(value.requested_at ? formatDate(value.requested_at) : null);
      this.form.patchValue({ byline: value.byline ?? '', note: value.note ?? '', bio: value.bio ?? '' });
    });
  }

  protected send(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.busy.set(true);
    this.error.set(null);
    this.#http.post<AuthorRequest>(`${API_URL}/author-request`, { ...value, bio: value.bio || null }).subscribe({
      next: (response) => this.sent.set(response.message ?? 'Prijava je poslata.'),
      error: (error) => {
        this.busy.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}
