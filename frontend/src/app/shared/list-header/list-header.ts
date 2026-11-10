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
      align-items: center;
      justify-content: space-between;
      gap: 8px 12px;
      margin: 16px 0 12px;
      padding: 0 16px;
    }
    @media (min-width: 900px) {
      :host {
        padding: 0 24px;
      }
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
