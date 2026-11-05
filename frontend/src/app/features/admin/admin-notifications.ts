import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { API_URL } from '../../core/http/api';
import { SubscriptionStats } from '../notifications/subscription.model';

@Component({
  selector: 'app-admin-notifications',
  imports: [MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin: 16px 0;
    }
    .stat {
      display: grid;
      gap: 4px;
      padding: 14px 16px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: var(--color-surface);
    }
    .stat strong {
      font-size: 28px;
      line-height: 1.1;
    }
    @media (min-width: 720px) {
      .stats {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
  `,
  template: `
    @if (stats.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    @if (stats.error()) {
      <p class="form-error" role="alert">Brojke nisu učitane. Pokušajte ponovo.</p>
    }
    @if (value(); as s) {
      <div class="stats">
        @for (item of tiles(); track item.label) {
          <div class="stat">
            <strong>{{ item.value }}</strong>
            <span class="muted">{{ item.label }}</span>
          </div>
        }
      </div>
      <p class="muted">
        Poslednje slanje: {{ s.last_sent_at ? formatDate(s.last_sent_at) : 'još nije bilo' }}.
        Istaknute vesti idu odmah (proverava se na 10 minuta), nedeljni pregled ponedeljkom u 7h; najviše {{ s.hourly_limit }} mejlova na sat, ostatak ide u sledećem krugu.
      </p>
    }
  `,
})
export class AdminNotifications {
  protected readonly stats = httpResource<SubscriptionStats>(() => `${API_URL}/admin/subscriptions/stats`);
  protected readonly value = computed(() => (this.stats.hasValue() ? this.stats.value() : null));
  protected readonly tiles = computed(() => {
    const s = this.value();
    return s
      ? [
          { label: 'aktivnih pretplatnika', value: s.active },
          { label: 'prima odmah', value: s.instant },
          { label: 'prima nedeljni pregled', value: s.weekly },
          { label: 'čeka potvrdu mejla', value: s.pending },
          { label: 'poslato za 7 dana', value: s.sent_7d },
          { label: 'poslato za 30 dana', value: s.sent_30d },
          { label: 'neuspelo za 30 dana', value: s.failed_30d },
          { label: `odjava (${s.unsubscribed_30d} za 30 dana)`, value: s.unsubscribed },
        ]
      : [];
  });

  protected formatDate(value: string): string {
    return new Date(value.replace(' ', 'T')).toLocaleString('sr-Latn-RS', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
