import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { Institution, InstitutionType } from './institution.model';

interface ListState {
  items: Institution[] | null;
  loading: boolean;
  error: string | null;
}

const EMPTY: ListState = { items: null, loading: false, error: null };

@Injectable({ providedIn: 'root' })
export class InstitutionStore {
  readonly #http = inject(HttpClient);
  readonly #lists: Record<InstitutionType, WritableSignal<ListState>> = {
    osnovna: signal(EMPTY),
    srednja: signal(EMPTY),
    fakultet: signal(EMPTY),
  };

  state(type: InstitutionType): Signal<ListState> {
    return this.#lists[type].asReadonly();
  }

  replace(item: Institution): void {
    this.#lists[item.type].update((state) => ({
      ...state,
      items: state.items?.map((current) => (current.id === item.id ? item : current)) ?? null,
    }));
  }

  load(type: InstitutionType, force = false): void {
    const state = this.#lists[type];
    if (state().loading || (state().items && !force)) {
      return;
    }
    state.update((current) => ({ ...current, loading: true, error: null }));
    this.#http.get<Institution[]>(`${API_URL}/institutions`, { params: { type } }).subscribe({
      next: (items) => state.set({ items, loading: false, error: null }),
      error: (error) => state.set({ items: state().items, loading: false, error: apiErrorMessage(error) }),
    });
  }
}
