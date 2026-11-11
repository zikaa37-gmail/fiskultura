import { DestroyRef, inject, linkedSignal, WritableSignal } from '@angular/core';

export const SEARCH_DELAY = 400;

export interface DebouncedSearch {
  schedule(value: string): void;
  flush(value: string): void;
}

export function debouncedSearch(apply: (value: string) => void, delay = SEARCH_DELAY): DebouncedSearch {
  let timer: ReturnType<typeof setTimeout> | undefined;
  inject(DestroyRef).onDestroy(() => clearTimeout(timer));
  return {
    schedule: (value) => {
      clearTimeout(timer);
      timer = setTimeout(() => apply(value.trim()), delay);
    },
    flush: (value) => {
      clearTimeout(timer);
      apply(value.trim());
    },
  };
}

export function searchDraft(source: () => string): WritableSignal<string> {
  return linkedSignal<string, string>({
    source,
    computation: (value, previous) => (previous && previous.value.trim() === value ? previous.value : value),
  });
}
