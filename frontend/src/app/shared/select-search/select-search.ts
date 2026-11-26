import { ChangeDetectionStrategy, Component, computed, ElementRef, forwardRef, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { ControlSize } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { Icon } from '../icon/icon';

export interface SelectSearchOption<T> {
  value: T;
  label: string;
}

export interface SelectSearchCustom {
  custom: string;
}

export type SelectSearchValue<T> = T | SelectSearchCustom | null;

export function isCustomValue<T>(value: SelectSearchValue<T>): value is SelectSearchCustom {
  return typeof value === 'object' && value !== null && 'custom' in value;
}

const EMPTY = { empty: true };
const CUSTOM = { custom: true };

function normalize(text: string): string {
  return text
    .toLocaleLowerCase('sr-Latn')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'dj')
    .trim();
}

@Component({
  selector: 'app-select-search',
  imports: [MatAutocompleteModule, MatInputModule, FORM_FIELD_IMPORTS, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectSearch), multi: true }],
  template: `
    <mat-form-field subscriptSizing="dynamic" appearance="outline" [size]="size()">
      <input
        #field
        matInput
        [id]="inputId()"
        [value]="text()"
        [placeholder]="customMode() ? customPlaceholder() : placeholder()"
        [disabled]="disabled()"
        [matAutocomplete]="auto"
        autocomplete="off"
        (input)="type($any($event.target).value)"
        (keydown.enter)="enter()"
        (blur)="touched()"
      />
      <app-icon matSuffix class="select-search-arrow" name="chevron-down" [size]="20" />
      <mat-autocomplete #auto [displayWith]="display" (optionSelected)="pick($event.option.value)" (closed)="closed()">
        @if (emptyLabel()) {
          <mat-option [value]="empty">{{ emptyLabel() }}</mat-option>
        }
        @for (option of filtered(); track option.value) {
          <mat-option [value]="option">{{ option.label }}</mat-option>
        }
        @if (allowCustom()) {
          <mat-option class="select-search-custom" [value]="custom">
            <app-icon name="plus" [size]="18" />
            {{ customText() ? customLabel() + ': „' + customText() + '”' : customAction() }}
          </mat-option>
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
    .select-search-arrow {
      margin-right: 12px;
      color: var(--color-muted);
    }
  `,
})
export class SelectSearch<T> implements ControlValueAccessor {
  readonly options = input.required<SelectSearchOption<T>[]>();
  readonly inputId = input.required<string>();
  readonly placeholder = input('Izaberi ili počni da kucaš');
  readonly emptyLabel = input('');
  readonly allowCustom = input(false);
  readonly customLabel = input('Nova stavka');
  readonly customAction = input('Upiši novu stavku');
  readonly customPlaceholder = input('Upiši naziv');
  readonly size = input<ControlSize>('md');

  protected readonly display = (choice: SelectSearchOption<T> | typeof EMPTY | typeof CUSTOM | null): string =>
    choice === CUSTOM ? this.customText() : choice && choice !== EMPTY ? (choice as SelectSearchOption<T>).label : '';
  protected readonly empty = EMPTY;
  protected readonly custom = CUSTOM;
  protected readonly disabled = signal(false);
  protected readonly customMode = signal(false);
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly trigger = viewChild.required(MatAutocompleteTrigger);
  readonly #value = signal<SelectSearchValue<T>>(null);
  readonly #query = signal<string | null>(null);

  readonly #label = computed(() => {
    const value = this.#value();
    if (isCustomValue(value)) {
      return value.custom;
    }
    return this.options().find((option) => option.value === value)?.label ?? '';
  });
  protected readonly text = computed(() => this.#query() ?? this.#label());
  protected readonly filtered = computed(() => {
    const query = normalize(this.#query() ?? '');
    return query ? this.options().filter((option) => normalize(option.label).includes(query)) : this.options();
  });
  protected readonly customText = computed(() => {
    const query = (this.#query() ?? '').trim();
    if (!query || this.options().some((option) => normalize(option.label) === normalize(query))) {
      return '';
    }
    return query;
  });

  #onChange: (value: SelectSearchValue<T>) => void = () => undefined;
  #onTouched: () => void = () => undefined;

  writeValue(value: SelectSearchValue<T>): void {
    this.#value.set(value ?? null);
    this.#query.set(null);
  }

  registerOnChange(fn: (value: SelectSearchValue<T>) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  protected type(text: string): void {
    this.#query.set(text);
  }

  protected touched(): void {
    this.#onTouched();
    if (this.customMode() && !this.trigger().panelOpen) {
      if (this.customText()) {
        this.#commit({ custom: this.customText() });
      } else {
        this.customMode.set(false);
        this.#query.set(null);
      }
    }
  }

  protected pick(choice: SelectSearchOption<T> | typeof EMPTY | typeof CUSTOM): void {
    if (choice === CUSTOM && !this.customText()) {
      this.customMode.set(true);
      this.#query.set('');
      setTimeout(() => this.field().nativeElement.focus());
      return;
    }
    this.#commit(choice === CUSTOM ? { custom: this.customText() } : choice === EMPTY ? null : (choice as SelectSearchOption<T>).value);
  }

  protected enter(): void {
    if (this.customMode() && this.customText() && !this.trigger().activeOption) {
      this.#commit({ custom: this.customText() });
      this.trigger().closePanel();
    }
  }

  protected closed(): void {
    if (this.customMode() && this.customText()) {
      this.#commit({ custom: this.customText() });
      return;
    }
    if (!this.customMode()) {
      this.#query.set(null);
    }
  }

  #commit(value: SelectSearchValue<T>): void {
    this.customMode.set(false);
    this.#value.set(value);
    this.#query.set(null);
    this.#onChange(value);
  }
}
