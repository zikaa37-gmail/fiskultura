import { Injectable, computed, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { API_URL } from '../../core/http/api';
import { Topic } from './article.model';

@Injectable({ providedIn: 'root' })
export class ArticleTopicStore {
  readonly #requested = signal(false);
  readonly #resource = httpResource<Topic[]>(() => (this.#requested() ? `${API_URL}/topics` : undefined));

  readonly topics = computed(() => (this.#resource.hasValue() ? this.#resource.value() : []));

  load(): this {
    this.#requested.set(true);
    return this;
  }

  reload(): void {
    this.#resource.reload();
  }
}
