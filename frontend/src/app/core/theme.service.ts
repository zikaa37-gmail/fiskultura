import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type ThemeChoice = 'system' | 'light' | 'dark';

const THEME_KEY = 'fk_theme';

export const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'Kao uređaj' },
  { value: 'light', label: 'Svetla' },
  { value: 'dark', label: 'Tamna' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly #document = inject(DOCUMENT);
  readonly #storage = isPlatformBrowser(inject(PLATFORM_ID)) ? localStorage : null;

  readonly #choice = signal<ThemeChoice>(this.#read());
  readonly choice = this.#choice.asReadonly();

  set(choice: ThemeChoice): void {
    this.#choice.set(choice);
    if (choice === 'system') {
      this.#storage?.removeItem(THEME_KEY);
    } else {
      this.#storage?.setItem(THEME_KEY, choice);
    }
    const classes = this.#document.documentElement.classList;
    classes.remove('theme-light', 'theme-dark');
    if (choice !== 'system') {
      classes.add(`theme-${choice}`);
    }
  }

  #read(): ThemeChoice {
    const stored = this.#storage?.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  }
}
