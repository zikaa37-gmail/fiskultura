import { HttpContext, HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

export const BUSY = new HttpContextToken<string | false | null>(() => null);

export const AI_BUSY_MESSAGE = 'AI radi na tome. To može da potraje do minut, ne zatvarajte stranicu.';

export function busyContext(message: string | false): HttpContext {
  return new HttpContext().set(BUSY, message);
}

export function aiBusy(): HttpContext {
  return busyContext(AI_BUSY_MESSAGE);
}

const DEFAULT_MESSAGE = 'Sačekajte trenutak…';
const SILENT_PATHS = [/\/auth\/refresh$/, /\/auth\/logout$/, /\/notifications\/read$/, /\/admin\/mailbox\/messages\/\d+$/];

@Injectable({ providedIn: 'root' })
export class BusyService {
  readonly #tasks = signal<{ id: number; message: string }[]>([]);
  #next = 0;

  readonly active = computed(() => this.#tasks().length > 0);
  readonly message = computed(() => this.#tasks().at(-1)?.message ?? DEFAULT_MESSAGE);
  readonly ai = computed(() => this.#tasks().some((task) => task.message === AI_BUSY_MESSAGE));

  start(message: string = DEFAULT_MESSAGE): () => void {
    const id = ++this.#next;
    this.#tasks.update((tasks) => [...tasks, { id, message }]);
    return () => this.#tasks.update((tasks) => tasks.filter((task) => task.id !== id));
  }
}

export const busyInterceptor: HttpInterceptorFn = (request, next) => {
  const setting = request.context.get(BUSY);
  const mutating = request.method !== 'GET' && request.method !== 'HEAD';
  const silent = setting === false || (setting === null && (!mutating || SILENT_PATHS.some((path) => path.test(request.url))));
  if (silent) {
    return next(request);
  }
  const stop = inject(BusyService).start(setting || DEFAULT_MESSAGE);
  return next(request).pipe(finalize(stop));
};
