import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { API_URL } from '../../core/http/api';
import { Institution, INSTITUTION_TYPE_LABELS } from '../../features/community/institution.model';
import { debouncedSearch } from '../list-filters/search-input';

@Component({
  selector: 'app-school-field',
  imports: [MatAutocompleteModule, MatInputModule, FORM_FIELD_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'school-field' },
  template: `
    <mat-form-field appearance="outline" [subscriptSizing]="subscriptSizing()">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [attr.name]="name()"
        maxlength="190"
        autocomplete="off"
        [value]="value()"
        [matAutocomplete]="auto"
        (input)="type($any($event.target).value)"
        (blur)="search.flush(value())"
      />
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="display" (optionSelected)="pick($event.option.value)">
        @for (item of options(); track item.id) {
          <mat-option [value]="item">
            <span class="school-option">
              <span>{{ item.label }}</span>
              <span class="small muted">{{ typeLabels[item.type] }}</span>
            </span>
          </mat-option>
        }
      </mat-autocomplete>
      <mat-hint>{{ hint() }}</mat-hint>
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
    }
    mat-form-field {
      width: 100%;
    }
    .school-option {
      display: grid;
      line-height: 1.3;
      padding: 4px 0;
    }
  `,
})
export class SchoolField {
  readonly value = model('');
  readonly label = input('Škola ili fakultet');
  readonly name = input('school');
  readonly subscriptSizing = input<'fixed' | 'dynamic'>('dynamic');
  readonly hint = input('Počnite da kucate naziv ili mesto. Ako ustanove nema na spisku, upišite je.');
  readonly picked = output<Institution>();

  protected readonly typeLabels = INSTITUTION_TYPE_LABELS;
  readonly #query = signal('');
  protected readonly search = debouncedSearch((text) => this.#query.set(text), 300);

  readonly #results = httpResource<Institution[]>(() => {
    const text = this.#query();
    return text.length >= 2 ? { url: `${API_URL}/institutions/search`, params: { q: text } } : undefined;
  });
  protected readonly options = computed(() => (this.#query().length >= 2 && this.#results.hasValue() ? this.#results.value() : []));

  protected readonly display = (item: Institution | string | null): string => (typeof item === 'string' ? item : (item?.label ?? ''));

  protected type(text: string): void {
    this.value.set(text);
    this.search.schedule(text);
  }

  protected pick(item: Institution): void {
    this.value.set(item.label);
    this.picked.emit(item);
  }
}
