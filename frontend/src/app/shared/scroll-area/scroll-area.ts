import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, input, signal } from '@angular/core';

@Component({
  selector: 'app-scroll-area',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'scroll-area',
    tabindex: '0',
    role: 'region',
    '[attr.aria-label]': 'label()',
    '[style.max-height]': 'height()',
  },
  template: `<ng-content />`,
  styles: `
    :host {
      display: block;
      overflow-y: auto;
      overscroll-behavior-y: contain;
      scrollbar-width: thin;
      scrollbar-color: var(--color-border) transparent;
      border-radius: 12px;
    }
    :host(:focus-visible) {
      outline: 2px solid color-mix(in srgb, var(--color-primary) 55%, transparent);
      outline-offset: 2px;
    }
  `,
})
export class ScrollArea {
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly maxHeight = input('70dvh');
  readonly fill = input(false);
  readonly minHeight = input(280);
  readonly label = input<string>();
  readonly resetOn = input<unknown>();

  readonly #fillHeight = signal<number | null>(null);
  protected readonly height = computed(() => {
    const fill = this.#fillHeight();
    return this.fill() && fill !== null ? `${fill}px` : this.maxHeight();
  });

  constructor() {
    effect(() => {
      this.resetOn();
      this.#host.nativeElement.scrollTop = 0;
    });

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const measure = () => this.#measure();
      const observer = new ResizeObserver(measure);
      observer.observe(document.body);
      window.addEventListener('resize', measure);
      measure();
      destroyRef.onDestroy(() => {
        observer.disconnect();
        window.removeEventListener('resize', measure);
      });
    });
  }

  #measure(): void {
    if (!this.fill()) {
      return;
    }
    const host = this.#host.nativeElement;
    const box = host.getBoundingClientRect();
    const last = host.parentElement?.lastElementChild;
    const below = last && last !== host ? Math.max(0, last.getBoundingClientRect().bottom - box.bottom) : 0;
    const top = box.top + window.scrollY;
    const available = Math.floor(window.innerHeight - top - below - 16);
    this.#fillHeight.set(Math.max(this.minHeight(), available));
  }
}
