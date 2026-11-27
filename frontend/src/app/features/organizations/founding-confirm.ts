import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { FoundingConfirmation } from './founding.model';

@Component({
  selector: 'app-founding-confirm',
  imports: [RouterLink, BUTTON_IMPORTS, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container auth-wrap">
        <div class="auth-card">
          <p class="eyebrow">Osnivanje društva</p>
          @if (result(); as data) {
            <h1 class="mb-3">Prijava je potvrđena</h1>
            @if (data.people >= data.threshold) {
              <p class="mb-4">
                Za mesto {{ data.city }} prijavljeno je {{ data.people }} kolega. Svima smo poslali mejl sa kontaktima, a obavestili smo i
                savez SSPFVS.
              </p>
            } @else {
              <p class="mb-4">
                Za mesto {{ data.city }} je sada {{ data.people }} / {{ data.threshold }}. Kada se prijavi još
                {{ data.threshold - data.people }}, poslaćemo svima mejl sa kontaktima. Pozovite kolege iz aktiva da se prijave.
              </p>
            }
            <a mat-flat-button routerLink="/udruzenja/osnivanje">Kako se osniva društvo</a>
          } @else if (error(); as message) {
            <h1 class="mb-3">Link ne radi</h1>
            <p class="form-error mb-4" role="alert">{{ message }}</p>
            <a mat-stroked-button routerLink="/udruzenja/osnivanje">Nova prijava</a>
          } @else {
            <h1 class="mb-3">Potvrđujemo prijavu…</h1>
            <mat-progress-bar mode="indeterminate" />
          }
        </div>
      </div>
    </section>
  `,
})
export class FoundingConfirm implements OnInit {
  readonly id = input<string>();
  readonly token = input<string>();

  readonly #http = inject(HttpClient);

  protected readonly result = signal<FoundingConfirmation | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.#http.post<FoundingConfirmation>(`${API_URL}/founding-interests/confirm`, { id: Number(this.id()), token: this.token() ?? '' }).subscribe({
      next: (data) => this.result.set(data),
      error: (error) => this.error.set(apiErrorMessage(error, 'Link nije ispravan ili prijava više ne postoji.')),
    });
  }
}
