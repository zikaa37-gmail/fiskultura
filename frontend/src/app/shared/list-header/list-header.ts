import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-list-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="muted small">
      @if (count() !== null) {
        {{ label() }}: {{ count() }}
      }
    </p>
    <div class="list-header-actions">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 8px 12px;
      margin: 16px 0 12px;
      padding: 0 16px 12px;
      border-bottom: 1px solid var(--color-border);
    }
    @media (min-width: 900px) {
      :host {
        padding: 0 24px 12px;
      }
    }
    p {
      margin: 0;
      line-height: 1.2;
    }
    .list-header-actions {
      display: flex;
      flex-wrap: nowrap;
      gap: 8px;
      margin-left: auto;
    }
  `,
})
export class ListHeader {
  readonly count = input<number | null>(null);
  readonly label = input('Ukupno');
}
