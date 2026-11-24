import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BusyService } from '../../core/http/busy';

@Component({
  selector: 'app-busy-overlay',
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (busy.active()) {
      <div class="busy-overlay" role="alertdialog" aria-modal="true" aria-live="assertive" aria-busy="true" [attr.aria-label]="busy.message()" (keydown)="$event.preventDefault()" tabindex="-1">
        <div class="busy-card" [class.busy-ai]="busy.ai()">
          <mat-progress-spinner mode="indeterminate" diameter="40" strokeWidth="4" />
          <p>{{ busy.message() }}</p>
        </div>
      </div>
    }
  `,
  styles: `
    .busy-overlay {
      position: fixed;
      inset: 0;
      z-index: 5000;
      display: grid;
      place-items: center;
      padding: 16px;
      background: transparent;
      cursor: progress;
      animation: busy-dim 0s linear 250ms forwards;
    }
    .busy-card {
      display: grid;
      justify-items: center;
      gap: 12px;
      max-width: 340px;
      padding: 20px 24px;
      border-radius: 12px;
      background: var(--color-surface);
      color: var(--color-text);
      box-shadow: 0 12px 40px rgba(11, 23, 54, 0.25);
      text-align: center;
      opacity: 0;
      animation: busy-show 150ms ease-out 250ms forwards;
      --mat-progress-spinner-active-indicator-color: var(--color-primary);
    }
    .busy-card.busy-ai {
      border-top: 4px solid var(--color-violet);
      --mat-progress-spinner-active-indicator-color: var(--color-violet);
    }
    .busy-card p {
      margin: 0;
      font-size: 15px;
      line-height: 1.4;
    }
    @keyframes busy-dim {
      to {
        background: rgba(11, 23, 54, 0.35);
      }
    }
    @keyframes busy-show {
      to {
        opacity: 1;
      }
    }
  `,
})
export class BusyOverlay {
  protected readonly busy = inject(BusyService);
}
