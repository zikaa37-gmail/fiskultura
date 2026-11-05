import { afterNextRender, computed, Injectable, signal } from '@angular/core';
import { RULE_CARDS } from './rules-content';

const PROGRESS_KEY = 'fk_gimnastika_pravila';

export interface RulesProgressState {
  opened: string[];
  best: number;
}

@Injectable({ providedIn: 'root' })
export class GymnasticsRulesProgress {
  readonly state = signal<RulesProgressState>({ opened: [], best: 0 });
  readonly openedCount = computed(() => this.state().opened.filter((id) => RULE_CARDS.some((card) => card.id === id)).length);
  readonly allOpened = computed(() => this.openedCount() === RULE_CARDS.length);

  constructor() {
    afterNextRender(() => this.state.set(this.#read()));
  }

  isOpened(id: string): boolean {
    return this.state().opened.includes(id);
  }

  markOpened(id: string): void {
    if (!this.isOpened(id)) {
      this.#save({ ...this.state(), opened: [...this.state().opened, id] });
    }
  }

  saveBest(score: number): void {
    if (score > this.state().best) {
      this.#save({ ...this.state(), best: score });
    }
  }

  reset(): void {
    this.#save({ opened: [], best: 0 });
  }

  #read(): RulesProgressState {
    try {
      const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? 'null') as Partial<RulesProgressState> | null;
      return { opened: Array.isArray(stored?.opened) ? stored.opened : [], best: Number(stored?.best) || 0 };
    } catch {
      return { opened: [], best: 0 };
    }
  }

  #save(state: RulesProgressState): void {
    this.state.set(state);
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
    } catch {
      return;
    }
  }
}
