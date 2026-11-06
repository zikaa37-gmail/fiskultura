import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-back-to-top',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <button type="button" class="back-to-top" aria-label="Na vrh stranice" title="Na vrh stranice" (click)="toTop()">
        <app-icon name="arrow-up" />
      </button>
    }
  `,
})
export class BackToTop {
  protected readonly visible = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const update = () => this.visible.set(window.scrollY > Math.min(600, window.innerHeight));
      update();
      window.addEventListener('scroll', update, { passive: true });
      destroyRef.onDestroy(() => window.removeEventListener('scroll', update));
    });
  }

  protected toTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
