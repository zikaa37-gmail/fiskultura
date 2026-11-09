import { ChangeDetectionStrategy, Component, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { NewsCategory } from '../news/news.model';
import { SubscriptionFields } from './subscription-fields';
import { Subscription, SubscriptionFrequency } from './subscription.model';

@Component({
  selector: 'app-notifications-dialog',
  imports: [MatButtonModule, MatDialogModule, MatProgressBarModule, DialogShell, SubscriptionFields],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell title="Moja obaveštenja">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      } @else if (loadError(); as message) {
        <p class="form-error" role="alert">{{ message }}</p>
      } @else {
        <p class="muted mb-1">{{ email() }}</p>
        <p class="mb-4">
          <span class="status" [class.status-next]="active()">{{ active() ? 'Uključena' : 'Isključena' }}</span>
        </p>
        <app-subscription-fields [(frequency)]="frequency" [(categories)]="categories" [(organizationIds)]="organizationIds" />
        @if (error(); as message) {
          <p class="form-error" role="alert">{{ message }}</p>
        }
      }
      <ng-container dialogActions>
        @if (active()) {
          <button type="button" mat-stroked-button [disabled]="busy() || loading()" (click)="submit(false)">Isključi</button>
        }
        <button type="button" mat-flat-button [disabled]="busy() || loading() || !!loadError()" (click)="submit(true)">{{ active() ? 'Sačuvaj' : 'Uključi obaveštenja' }}</button>
      </ng-container>
    </app-dialog-shell>
  `,
})
export class NotificationsDialog {
  readonly #http = inject(HttpClient);
  readonly #ref = inject(MatDialogRef<NotificationsDialog>);
  readonly #notifications = inject(NotificationService);

  protected readonly email = signal('');
  protected readonly frequency = signal<SubscriptionFrequency>('instant');
  protected readonly categories = signal<NewsCategory[]>([]);
  protected readonly organizationIds = signal<number[]>([]);
  protected readonly active = signal(false);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly loadError = signal<string | null>(null);

  constructor() {
    this.#http.get<Subscription>(`${API_URL}/me/subscription`).subscribe({
      next: (subscription) => {
        this.#apply(subscription);
        this.loading.set(false);
      },
      error: (error) => {
        this.loadError.set(apiErrorMessage(error));
        this.loading.set(false);
      },
    });
  }

  protected submit(active: boolean): void {
    this.busy.set(true);
    this.error.set(null);
    this.#http
      .put<Subscription>(`${API_URL}/me/subscription`, { frequency: this.frequency(), categories: this.categories(), organization_ids: this.organizationIds(), active })
      .subscribe({
        next: (subscription) => {
          this.#notifications.show(subscription.active ? 'Obaveštenja su sačuvana.' : 'Obaveštenja su isključena.');
          this.#ref.close(subscription);
        },
        error: (error) => {
          this.error.set(apiErrorMessage(error));
          this.busy.set(false);
        },
      });
  }

  #apply(subscription: Subscription): void {
    this.email.set(subscription.email);
    this.frequency.set(subscription.frequency);
    this.categories.set(subscription.categories);
    this.organizationIds.set(subscription.organization_ids);
    this.active.set(subscription.active);
  }
}

@Injectable({ providedIn: 'root' })
export class NotificationsDialogService {
  readonly #dialog = inject(MatDialog);

  open(): MatDialogRef<NotificationsDialog, Subscription> {
    return this.#dialog.open(NotificationsDialog, { width: '640px', maxWidth: '100vw', panelClass: 'app-dialog-panel', autoFocus: false });
  }
}
