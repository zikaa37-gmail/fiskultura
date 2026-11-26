import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { Icon } from '../icon/icon';

const LANGUAGES = ['sr', 'hr', 'bs', 'sh', 'cnr'];

export function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  for (const language of LANGUAGES) {
    const matches = voices.filter((voice) => voice.lang.toLowerCase().replace('_', '-').split('-')[0] === language);
    const latin = matches.find((voice) => /latn/i.test(voice.lang) || /latin/i.test(voice.name));
    if (latin ?? matches[0]) {
      return latin ?? matches[0];
    }
  }
  return null;
}

export function speechChunks(text: string, max = 220): string[] {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…:;])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  for (const sentence of sentences) {
    const last = chunks.at(-1);
    if (last && last.length + sentence.length + 1 <= max) {
      chunks[chunks.length - 1] = `${last} ${sentence}`;
    } else {
      chunks.push(sentence);
    }
  }
  return chunks;
}

@Component({
  selector: 'app-read-aloud',
  imports: [BUTTON_IMPORTS, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (voice()) {
      <button type="button" mat-stroked-button theme="tertiary" size="sm" [attr.aria-pressed]="speaking()" (click)="toggle()">
        <app-icon [name]="speaking() ? 'stop' : 'volume'" [size]="18" />
        {{ speaking() ? 'Zaustavi čitanje' : 'Slušaj tekst' }}
      </button>
    }
  `,
})
export class ReadAloud {
  readonly text = input.required<string>();

  protected readonly voice = signal<SpeechSynthesisVoice | null>(null);
  protected readonly speaking = signal(false);
  #synth: SpeechSynthesis | null = null;
  #run = 0;

  constructor() {
    afterNextRender(() => {
      if (!('speechSynthesis' in window)) {
        return;
      }
      const synth = window.speechSynthesis;
      this.#synth = synth;
      const load = () => this.voice.set(pickVoice(synth.getVoices()));
      load();
      synth.addEventListener('voiceschanged', load);
    });
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected toggle(): void {
    if (this.speaking()) {
      this.stop();
      return;
    }
    const synth = this.#synth;
    const voice = this.voice();
    if (!synth || !voice) {
      return;
    }
    synth.cancel();
    const run = ++this.#run;
    const chunks = speechChunks(this.text());
    this.speaking.set(true);
    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = 0.95;
      if (index === chunks.length - 1) {
        utterance.onend = () => run === this.#run && this.speaking.set(false);
      }
      utterance.onerror = () => run === this.#run && this.speaking.set(false);
      synth.speak(utterance);
    });
  }

  protected stop(): void {
    this.#run++;
    this.#synth?.cancel();
    this.speaking.set(false);
  }
}
