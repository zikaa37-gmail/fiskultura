import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { FilterPanel } from '../filter-panel/filter-panel';
import { debouncedSearch } from './search-input';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  type?: 'select' | 'search';
  options?: FilterOption[];
  allLabel?: string;
}

export type FilterValues = Record<string, string>;

export interface FilterChange {
  key: string;
  value: string;
}

@Component({
  selector: 'app-list-filters',
  imports: [FormsModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatSelectModule, FilterPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-filter-panel [title]="title()" [summary]="summary()">
      @for (field of fields(); track field.key) {
        @if (field.type === 'search') {
          <form class="search-form" (ngSubmit)="submitSearch(field.key)">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>{{ field.label }}</mat-label>
              <input
                matInput
                type="search"
                enterkeyhint="search"
                [name]="field.key"
                [ngModel]="drafts()[field.key] ?? ''"
                (ngModelChange)="setDraft(field.key, $event)"
              />
            </mat-form-field>
          </form>
        } @else {
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>{{ field.label }}</mat-label>
            <mat-select [value]="values()[field.key] ?? ''" (selectionChange)="filterChange.emit({ key: field.key, value: $event.value })">
              <mat-option value="">{{ field.allLabel ?? 'Sve' }}</mat-option>
              @for (option of field.options ?? []; track option.value) {
                <mat-option [value]="option.value">{{ option.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
      }
      @if (hasValues()) {
        <button type="button" mat-button theme="tertiary" class="clear-filters" (click)="clearAll.emit()">Poništi filtere</button>
      }
    </app-filter-panel>
  `,
})
export class ListFilters {
  readonly fields = input.required<FilterField[]>();
  readonly values = input<FilterValues>({});
  readonly title = input('Filteri');
  readonly emptySummary = input('Sve');
  readonly filterChange = output<FilterChange>();
  readonly clearAll = output<void>();

  protected readonly hasValues = computed(() => this.fields().some((field) => !!this.values()[field.key]));

  protected readonly drafts = linkedSignal<FilterValues, FilterValues>({
    source: () => this.values(),
    computation: (values, previous) =>
      Object.fromEntries(
        Object.entries(values).map(([key, value]) => {
          const draft = previous?.value[key];
          return [key, draft !== undefined && draft.trim() === value ? draft : value];
        }),
      ),
  });
  #searchKey = '';
  readonly #search = debouncedSearch((value) => this.#emitSearch(this.#searchKey, value));

  protected readonly summary = computed(() => {
    const values = this.values();
    const parts = this.fields()
      .map((field) => {
        const value = values[field.key];
        if (!value) {
          return '';
        }
        if (field.type === 'search') {
          return `„${value}”`;
        }
        return field.options?.find((option) => option.value === value)?.label ?? '';
      })
      .filter(Boolean);
    return parts.length ? parts.join(' · ') : this.emptySummary();
  });

  protected setDraft(key: string, value: string): void {
    this.drafts.update((drafts) => ({ ...drafts, [key]: value }));
    this.#searchKey = key;
    this.#search.schedule(value);
  }

  protected submitSearch(key: string): void {
    this.#searchKey = key;
    this.#search.flush(this.drafts()[key] ?? '');
  }

  #emitSearch(key: string, value: string): void {
    if (value !== (this.values()[key] ?? '')) {
      this.filterChange.emit({ key, value });
    }
  }
}
