import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { TOGGLE_IMPORTS } from '../../../theme/ui/toggle';
import { FacilityField, FacilityValue } from './facility.model';

export interface FacilityFieldChange {
  field: string;
  value: FacilityValue | null;
}

const BLOCKED_INTEGER_KEYS = ['.', ',', 'e', 'E', '-', '+'];

@Component({
  selector: 'app-facility-fields',
  imports: [MatInputModule, MatSelectModule, FORM_FIELD_IMPORTS, TOGGLE_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (field of list(); track field.key) {
      @if (field.heading) {
        <p class="facility-section">{{ field.heading }}</p>
      }
      @switch (field.type) {
        @case ('bool') {
          <mat-slide-toggle [checked]="values()[field.key] === true" (change)="emit(field.key, $event.checked)">{{ field.label }}</mat-slide-toggle>
        }
        @case ('select') {
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>{{ field.label }}</mat-label>
            <mat-select [value]="values()[field.key] ?? ''" (selectionChange)="emit(field.key, $event.value || null)">
              <mat-option value="">—</mat-option>
              @for (option of field.options ?? []; track option) {
                <mat-option [value]="option">{{ option }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
        @default {
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>{{ field.label }}</mat-label>
            <input
              matInput
              type="number"
              min="0"
              [step]="field.type === 'integer' ? 1 : 0.1"
              [attr.inputmode]="field.type === 'integer' ? 'numeric' : 'decimal'"
              [value]="values()[field.key] ?? ''"
              (keydown)="guard($event, field.type)"
              (input)="number($event, field.key, field.type)"
            />
          </mat-form-field>
        }
      }
    }
  `,
  styles: `
    :host {
      display: contents;
    }
    mat-form-field {
      width: 100%;
    }
    .facility-section {
      grid-column: 1 / -1;
      margin: 8px 0 0;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-muted);
    }
  `,
})
export class FacilityFields {
  readonly fields = input.required<Record<string, FacilityField>>();
  readonly values = input.required<Record<string, unknown>>();
  readonly changed = output<FacilityFieldChange>();

  protected readonly list = computed(() =>
    Object.entries(this.fields()).map(([key, field], index, all) => ({ key, ...field, heading: field.section && field.section !== all[index - 1]?.[1].section ? field.section : null })),
  );

  protected emit(field: string, value: FacilityValue | null): void {
    this.changed.emit({ field, value });
  }

  protected guard(event: KeyboardEvent, type: string): void {
    if (BLOCKED_INTEGER_KEYS.includes(event.key) && (type === 'integer' || event.key === '-' || event.key === 'e' || event.key === 'E')) {
      event.preventDefault();
    }
  }

  protected number(event: Event, field: string, type: string): void {
    const target = event.target as HTMLInputElement;
    if (target.value === '') {
      this.emit(field, null);
      return;
    }
    const parsed = Math.max(0, Number(target.value));
    const value = type === 'integer' ? Math.trunc(parsed) : parsed;
    if (String(value) !== target.value) {
      target.value = String(value);
    }
    this.emit(field, Number.isFinite(value) ? value : null);
  }
}
