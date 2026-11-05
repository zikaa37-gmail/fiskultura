import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { Subscription } from './subscription.model';

@Component({
  selector: 'app-subscription-link',
  imports: [RouterLink, MatButtonModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .actions {
      display: grid;
      gap: 8px;
    }
  `,
  template: `
    <section class="section">
      <div class="container auth-wrap">
        <div class="auth-card">
          <p class="eyebrow">Obaveštenja mejlom</p>
          @if (result(); as subscription) {
            <h1>{{ action() === 'confirm' ? 'Prijava je potvrđena' : 'Odjavljeni ste' }}</h1>
            <p>
              {{ action() === 'confirm'
                ? 'Obaveštenja će stizati na ' + subscription.email + '. Šta pratite i koliko često, menjate u podešavanjima.'
                : 'Adresa ' + subscription.email + ' više neće dobijati obaveštenja portala Fiskultura.' }}
            </p>
            <div class="actions">
              <a mat-flat-button routerLink="/obavestenja" [queryParams]="{ id: subscription.id, token: subscription.manage_token }">
                {{ action() === 'confirm' ? 'Podešavanja obaveštenja' : 'Uključi ponovo' }}
              </a>
              <a mat-stroked-button routerLink="/vesti">Na vesti</a>
            </div>
          } @else if (error(); as message) {
            <h1>Link ne radi</h1>
            <p class="form-error" role="alert">{{ message }}</p>
            <a mat-stroked-button routerLink="/obavestenja">Nova prijava</a>
          } @else {
            <h1>{{ action() === 'confirm' ? 'Potvrđujemo prijavu…' : 'Odjavljujemo…' }}</h1>
            <mat-progress-bar mode="indeterminate" />
          }
        </div>
      </div>
    </section>
  `,
})
export class SubscriptionLink implements OnInit {
  readonly action = input.required<'confirm' | 'unsubscribe'>();
  readonly id = input<string>();
  readonly token = input<string>();

  readonly #http = inject(HttpClient);

  protected readonly result = signal<Subscription | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly endpoint = computed(() => `${API_URL}/subscriptions/${this.action()}`);

  ngOnInit(): void {
    this.#http.post<Subscription>(this.endpoint(), { id: Number(this.id()), token: this.token() ?? '' }).subscribe({
      next: (subscription) => this.result.set(subscription),
      error: (error) => this.error.set(apiErrorMessage(error, 'Link nije ispravan ili prijava više ne postoji.')),
    });
  }
}
