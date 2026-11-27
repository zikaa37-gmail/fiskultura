import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InfoTip } from '../info-tip/info-tip';

@Component({
  selector: 'app-field-label',
  imports: [InfoTip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'field-label' },
  template: `
    <label [attr.for]="for()">
      {{ text() }}
      @if (required()) {
        <span class="field-label-required" aria-hidden="true">*</span>
      }
    </label>
    @if (info()) {
      <app-info-tip class="field-label-info" [label]="'Objašnjenje: ' + text()">{{ info() }}</app-info-tip>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 2px;
      min-height: 32px;
    }
    label {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
    }
    .field-label-info {
      margin: -6px 0;
    }
    .field-label-required {
      margin-left: 2px;
      color: var(--color-muted);
    }
  `,
})
export class FieldLabel {
  readonly text = input.required<string>();
  readonly for = input.required<string>();
  readonly info = input('');
  readonly required = input(false);
}
