import { ChangeDetectionStrategy, Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';

const GUTTER = 16;
const WIDTH = 320;

@Component({
  selector: 'app-info-tip',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'info-tip',
    '(document:keydown.escape)': 'close()',
    '(window:resize)': 'close()',
    '(window:scroll)': 'close()',
  },
  template: `
    <button #trigger type="button" class="info-tip-trigger" [attr.aria-label]="label()" [attr.aria-expanded]="!!position()" [title]="label()" (click)="toggle()">
      <app-icon name="info" [size]="20" />
    </button>
    @if (position(); as pos) {
      <div class="info-tip-backdrop" (click)="close()"></div>
      <div class="info-tip-popover" role="note" [style.top.px]="pos.top" [style.left.px]="pos.left" [style.width.px]="pos.width">
        <ng-content />
      </div>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      vertical-align: middle;
    }
    .info-tip-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      padding: 0;
      border: none;
      border-radius: 8px;
      background: none;
      color: var(--color-muted);
      cursor: pointer;
    }
    .info-tip-trigger:hover,
    .info-tip-trigger[aria-expanded='true'] {
      color: var(--color-primary);
      background: var(--color-tertiary);
    }
    .info-tip-trigger:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    .info-tip-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
    }
    .info-tip-popover {
      position: fixed;
      z-index: 1001;
      padding: 12px 16px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-surface);
      box-shadow: var(--shadow);
      color: var(--color-text);
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5;
    }
  `,
})
export class InfoTip {
  readonly label = input('Objašnjenje');

  protected readonly position = signal<{ top: number; left: number; width: number } | null>(null);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  protected toggle(): void {
    if (this.position()) {
      this.close();
      return;
    }
    const rect = this.trigger().nativeElement.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    const width = Math.min(WIDTH, viewport - 2 * GUTTER);
    const left = Math.max(GUTTER, Math.min(rect.left, viewport - GUTTER - width));
    this.position.set({ top: rect.bottom + 4, left, width });
  }

  protected close(): void {
    this.position.set(null);
  }
}
