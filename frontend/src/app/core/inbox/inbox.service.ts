import { DestroyRef, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { API_URL } from '../http/api';

export interface InboxItem {
  id: number;
  kind: string;
  title: string;
  body: string | null;
  url: string | null;
  channels: string[];
  read: boolean;
  created_at: string | null;
}

export const CHANNEL_LABELS: Record<string, string> = {
  mail: 'mejl',
  whatsapp: 'WhatsApp',
  viber: 'Viber',
  sms: 'SMS',
};

const REFRESH_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class InboxService {
  readonly #http = inject(HttpClient);
  readonly #auth = inject(AuthService);

  readonly unread = signal(0);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    effect(() => {
      if (this.#auth.isAuthenticated()) {
        this.refresh();
      } else {
        this.unread.set(0);
      }
    });
    const timer = setInterval(() => this.#auth.isAuthenticated() && this.refresh(), REFRESH_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  refresh(): void {
    this.#http.get<{ unread: number }>(`${API_URL}/me/notifications/unread`).subscribe({
      next: ({ unread }) => this.unread.set(unread),
      error: () => undefined,
    });
  }

  markRead(ids: number[] | 'all'): void {
    this.#http.post<{ unread: number }>(`${API_URL}/me/notifications/read`, ids === 'all' ? { all: true } : { ids }).subscribe({
      next: ({ unread }) => this.unread.set(unread),
      error: () => undefined,
    });
  }

  setUnread(count: number): void {
    this.unread.set(count);
  }
}
