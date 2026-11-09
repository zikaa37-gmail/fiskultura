import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/auth/auth.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NewsCategory } from '../news/news.model';
import { SubscriptionFields } from './subscription-fields';
import { Subscription, SubscriptionFrequency } from './subscription.model';

type Mode = 'public' | 'link' | 'mine';

@Component({
  selector: 'app-notifications',
  imports: [FormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, SubscriptionFields],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    form {
      display: grid;
      gap: 8px;
      min-width: 0;
    }
    mat-form-field {
      width: 100%;
    }
    .status-line {
      font-weight: 600;
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
          <p class="eyebrow">Obaveštenja mejlom</p>
          <h1>{{ mode() === 'public' ? 'Prijava na obaveštenja' : 'Moja obaveštenja' }}</h1>

          @if (sentMessage(); as message) {
            <p>{{ message }}</p>
            <a mat-stroked-button routerLink="/vesti">Na vesti</a>
          } @else if (loadError(); as message) {
            <p class="form-error" role="alert">{{ message }}</p>
            <a mat-stroked-button routerLink="/obavestenja">Nova prijava</a>
          } @else {
            @if (loading()) {
              <mat-progress-bar mode="indeterminate" />
            }
            @if (mode() === 'public') {
              <p class="muted">Vesti, seminari, takmičenja i konkursi koje izaberete stižu vam mejlom. Prijavu potvrđujete klikom na link iz mejla, a odjava je jednim klikom iz svakog mejla.</p>
            } @else {
              <p class="muted">{{ email() }}</p>
              <p class="status-line">{{ active() ? 'Obaveštenja su uključena.' : 'Obaveštenja su isključena.' }}</p>
            }

            <form (ngSubmit)="save()">
              @if (mode() === 'public') {
                <mat-form-field appearance="outline">
                  <mat-label>Mejl</mat-label>
                  <input matInput type="email" name="email" autocomplete="email" required [ngModel]="email()" (ngModelChange)="email.set($event)" />
                </mat-form-field>
              }

              <app-subscription-fields [(frequency)]="frequency" [(categories)]="categories" [(organizationIds)]="organizationIds" />

              @if (error(); as message) {
                <p class="form-error" role="alert">{{ message }}</p>
              }
              @if (savedMessage(); as message) {
                <p role="status">{{ message }}</p>
              }

              <div class="actions">
                @if (mode() === 'public') {
                  <button type="submit" mat-flat-button [disabled]="busy() || !email()">Prijavi se</button>
                } @else {
                  <button type="submit" mat-flat-button [disabled]="busy() || loading()">{{ active() ? 'Sačuvaj podešavanja' : 'Uključi obaveštenja' }}</button>
                  @if (active()) {
                    <button type="button" mat-stroked-button [disabled]="busy()" (click)="turnOff()">Isključi obaveštenja</button>
                  }
                }
              </div>
            </form>

            @if (mode() === 'public') {
              <p class="muted">Imate nalog? <a routerLink="/prijava">Prijavite se</a> i obaveštenja uključujete bez potvrde mejlom.</p>
            }
          }
        </div>
      </div>
    </section>
  `,
})
export class NotificationsPage {
  readonly id = input<string>();
  readonly token = input<string>();

  readonly #http = inject(HttpClient);
  readonly #auth = inject(AuthService);

  protected readonly mode = computed<Mode>(() => (this.id() && this.token() ? 'link' : this.#auth.isAuthenticated() ? 'mine' : 'public'));

  protected readonly email = signal('');
  protected readonly frequency = signal<SubscriptionFrequency>('instant');
  protected readonly categories = signal<NewsCategory[]>([]);
  protected readonly organizationIds = signal<number[]>([]);
  protected readonly active = signal(false);

  protected readonly loading = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly loadError = signal<string | null>(null);
  protected readonly sentMessage = signal<string | null>(null);
  protected readonly savedMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const mode = this.mode();
      if (mode === 'public') {
        return;
      }
      this.loading.set(true);
      this.loadError.set(null);
      const request = mode === 'link'
        ? this.#http.post<Subscription>(`${API_URL}/subscriptions/manage`, this.#linkParams())
        : this.#http.get<Subscription>(`${API_URL}/me/subscription`);
      request.subscribe({
        next: (subscription) => {
          this.#apply(subscription);
          this.loading.set(false);
        },
        error: (error) => {
          this.loadError.set(apiErrorMessage(error, 'Link nije ispravan ili prijava više ne postoji.'));
          this.loading.set(false);
        },
      });
    });
  }

  protected save(): void {
    this.#submit(true);
  }

  protected turnOff(): void {
    this.#submit(false);
  }

  #submit(active: boolean): void {
    this.busy.set(true);
    this.error.set(null);
    this.savedMessage.set(null);
    const preferences = { frequency: this.frequency(), categories: this.categories(), organization_ids: this.organizationIds() };
    const mode = this.mode();

    if (mode === 'public') {
      this.#http.post<{ message: string }>(`${API_URL}/subscriptions`, { email: this.email().trim(), ...preferences }).subscribe({
        next: (response) => this.sentMessage.set(response.message),
        error: (error) => this.#fail(error),
      });
      return;
    }

    const request = mode === 'link'
      ? this.#http.patch<Subscription>(`${API_URL}/subscriptions/manage`, { ...this.#linkParams(), ...preferences, active })
      : this.#http.put<Subscription>(`${API_URL}/me/subscription`, { ...preferences, active });
    request.subscribe({
      next: (subscription) => {
        this.#apply(subscription);
        this.savedMessage.set(subscription.active ? 'Sačuvano. Obaveštenja stižu prema ovim podešavanjima.' : 'Obaveštenja su isključena.');
        this.busy.set(false);
      },
      error: (error) => this.#fail(error),
    });
  }

  #linkParams(): { id: number; token: string } {
    return { id: Number(this.id()), token: this.token() ?? '' };
  }

  #apply(subscription: Subscription): void {
    this.email.set(subscription.email);
    this.frequency.set(subscription.frequency);
    this.categories.set(subscription.categories);
    this.organizationIds.set(subscription.organization_ids);
    this.active.set(subscription.active);
  }

  #fail(error: unknown): void {
    this.error.set(apiErrorMessage(error));
    this.busy.set(false);
  }
}
