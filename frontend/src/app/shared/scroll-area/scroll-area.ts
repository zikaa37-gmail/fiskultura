import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input } from '@angular/core';

@Component({
  selector: 'app-scroll-area',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'scroll-area',
    tabindex: '0',
    role: 'region',
    '[attr.aria-label]': 'label()',
    '[style.max-height]': 'maxHeight()',
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
  readonly label = input<string>();
  readonly resetOn = input<unknown>();

  constructor() {
    effect(() => {
      this.resetOn();
      this.#host.nativeElement.scrollTop = 0;
    });
  }
}
