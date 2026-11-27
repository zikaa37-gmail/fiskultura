import { DestroyRef, effect, inject, Injectable, PLATFORM_ID, signal, untracked } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { API_URL } from '../http/api';
import { NotificationService } from '../notification.service';

const REFRESH_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class MailboxStatusService {
  readonly #http = inject(HttpClient);
  readonly #auth = inject(AuthService);
  readonly #notifications = inject(NotificationService);
  readonly #document = inject(DOCUMENT);

  readonly unread = signal(0);
  readonly arrived = signal(0);
  #latest: number | null = null;

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    effect(() => {
      if (this.#auth.isAdmin()) {
        untracked(() => this.refresh());
      } else {
        this.unread.set(0);
        this.#latest = null;
      }
    });
    const tick = () => this.#document.visibilityState === 'visible' && this.refresh();
    const timer = setInterval(tick, REFRESH_MS);
    this.#document.addEventListener('visibilitychange', tick);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      this.#document.removeEventListener('visibilitychange', tick);
    });
  }

  refresh(): void {
    if (!this.#auth.isAdmin()) {
      return;
    }
    this.#http.get<{ unread: number; latest: number | null }>(`${API_URL}/admin/mailbox/unseen`).subscribe({
      next: ({ unread, latest }) => {
        const previous = this.#latest;
        this.#latest = latest;
        this.unread.set(unread);
        if (previous !== null && latest !== null && latest > previous) {
          this.arrived.update((count) => count + 1);
          this.#notifications.show(latest - previous > 1 ? `Stiglo je ${latest - previous} nova mejla u poštu admin@.` : 'Stigao je novi mejl u poštu admin@.');
        }
      },
      error: () => undefined,
    });
  }
}
