import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { FilterOption } from '../list-filters/list-filters';

function fold(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'dj');
}

@Component({
  selector: 'app-select-search',
  imports: [MatAutocompleteModule, MatInputModule, FORM_FIELD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'select-search' },
  template: `
    <mat-form-field appearance="outline" subscriptSizing="dynamic">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        type="text"
        autocomplete="off"
        [placeholder]="allLabel()"
        [value]="text()"
        [matAutocomplete]="auto"
        (input)="text.set($any($event.target).value)"
        (focus)="$any($event.target).select()"
        (blur)="restore()"
      />
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="choose($event.option.value)">
        <mat-option value="">{{ allLabel() }}</mat-option>
        @for (option of filtered(); track option.value) {
          <mat-option [value]="option.value">{{ option.label }}</mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
    }
    mat-form-field {
      width: 100%;
    }
  `,
})
export class SelectSearch {
  readonly label = input.required<string>();
  readonly options = input.required<FilterOption[]>();
  readonly value = input('');
  readonly allLabel = input('Sve');
  readonly valueChange = output<string>();

  readonly #selectedLabel = computed(() => this.options().find((option) => option.value === this.value())?.label ?? '');
  protected readonly text = linkedSignal(() => this.#selectedLabel());
  protected readonly filtered = computed(() => {
    const needle = fold(this.text().trim());
    const options = this.options();
    if (!needle || needle === fold(this.#selectedLabel())) {
      return options;
    }
    return options.filter((option) => fold(option.label).includes(needle));
  });

  protected choose(value: string): void {
    this.text.set(this.options().find((option) => option.value === value)?.label ?? '');
    if (value !== this.value()) {
      this.valueChange.emit(value);
    }
  }

  protected restore(): void {
    setTimeout(() => this.text.set(this.#selectedLabel()), 150);
  }
}
