import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { API_URL } from '../../core/http/api';
import { FacilityCatalog } from './facility.model';

@Injectable({ providedIn: 'root' })
export class FacilityCatalogStore {
  readonly #http = inject(HttpClient);
  readonly #catalog = signal<FacilityCatalog | null>(null);
  #loading = false;

  readonly catalog = this.#catalog.asReadonly();

  load(): void {
    if (this.#loading || this.#catalog()) {
      return;
    }
    this.#loading = true;
    this.#http.get<FacilityCatalog>(`${API_URL}/institutions/facility-catalog`).subscribe({
      next: (catalog) => {
        this.#loading = false;
        this.#catalog.set(catalog);
      },
      error: () => {
        this.#loading = false;
      },
    });
  }
}
