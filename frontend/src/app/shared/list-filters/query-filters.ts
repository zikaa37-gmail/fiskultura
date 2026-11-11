import { computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterChange, FilterValues } from './list-filters';

export interface QueryFilters {
  readonly values: Signal<FilterValues>;
  set(change: FilterChange): void;
  clear(): void;
}

export function queryFilters(keys: readonly string[]): QueryFilters {
  const router = inject(Router);
  const query = toSignal(inject(ActivatedRoute).queryParamMap);
  return {
    values: computed(() => Object.fromEntries(keys.map((key) => [key, query()?.get(key) ?? '']))),
    set: (change) => router.navigate([], { queryParams: { [change.key]: change.value || null }, queryParamsHandling: 'merge' }),
    clear: () => router.navigate([], { queryParams: {} }),
  };
}

export function matchesSearch(term: string, values: (string | null | undefined)[]): boolean {
  const needle = term.trim().toLowerCase();
  return !needle || values.some((value) => value?.toLowerCase().includes(needle));
}
