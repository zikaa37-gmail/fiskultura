import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { API_URL } from '../../core/http/api';

export interface MemberPlace {
  district: string | null;
  municipality: string;
}

@Injectable({ providedIn: 'root' })
export class MemberPlacesStore {
  readonly #http = inject(HttpClient);
  readonly #places = signal<MemberPlace[] | null>(null);
  #loading = false;

  readonly places = this.#places.asReadonly();

  load(force = false): void {
    if (this.#loading || (this.#places() && !force)) {
      return;
    }
    this.#loading = true;
    this.#http.get<MemberPlace[]>(`${API_URL}/members/places`).subscribe({
      next: (places) => {
        this.#loading = false;
        this.#places.set(places);
      },
      error: () => {
        this.#loading = false;
      },
    });
  }
}
