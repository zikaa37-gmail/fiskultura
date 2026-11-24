import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { Icon } from '../../shared/icon/icon';
import { Facilities, FacilityCatalog, FacilityEntry, FacilityGroupValues, FacilityValue } from './facility.model';
import { FacilityFieldChange, FacilityFields } from './facility-fields';
import { Institution } from './institution.model';

export interface FacilityFormData {
  institution: Institution;
  catalog: FacilityCatalog;
  mode: 'edit' | 'submit';
}

export type FacilityFormResult = { saved: Institution } | { submitted: string };

type DraftEntry = Record<string, FacilityValue | null>;
type DraftGroup = Record<string, FacilityValue | null | DraftEntry[]>;
type Draft = Record<string, DraftGroup>;

function clean(values: Record<string, unknown>): FacilityEntry {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== null && value !== '' && value !== undefined && !Array.isArray(value))) as FacilityEntry;
}

@Component({
  selector: 'app-facility-form-dialog',
  imports: [MatDialogModule, MatInputModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, DialogShell, Icon, FacilityFields],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="'Infrastruktura: ' + data.institution.name">
      @if (data.mode === 'submit') {
        <p class="small muted mb-3">
          Upišite šta škola ima i u kakvom je stanju. Urednik proverava podatke pre objave, a vi dobijate mejl kad budu objavljeni. Polja koja ne
          znate ostavite prazna.
        </p>
      }
      @for (group of groups(); track group.key) {
        <fieldset class="facility-group">
          <legend>{{ group.label }}</legend>
          <app-facility-fields [fields]="group.fields" [values]="draft()[group.key] ?? {}" (changed)="set(group.key, $event)" />
          @if (group.list; as list) {
            @for (entry of entries(group.key, list.key); track $index) {
              <div class="facility-entry">
                <div class="facility-entry-head">
                  <strong>{{ list.label }} {{ $index + 1 }}</strong>
                  <button type="button" mat-button theme="danger" size="sm" [attr.aria-label]="'Ukloni: ' + list.label + ' ' + ($index + 1)" (click)="remove(group.key, list.key, $index)">
                    <app-icon name="trash" [size]="16" /> Ukloni
                  </button>
                </div>
                <app-facility-fields [fields]="list.fields" [values]="entry" (changed)="setEntry(group.key, list.key, $index, $event)" />
              </div>
            }
            <button type="button" mat-stroked-button theme="tertiary" size="sm" class="facility-add" (click)="add(group.key, list.key)">{{ list.add }}</button>
          }
        </fieldset>
      }
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Napomena</mat-label>
        <textarea matInput rows="3" maxlength="2000" [value]="note()" (input)="note.set($any($event.target).value)"></textarea>
      </mat-form-field>
      @if (error(); as text) {
        <p class="form-error" role="alert">{{ text }}</p>
      }
      <ng-container dialogActions>
        <button type="button" mat-stroked-button mat-dialog-close>Odustani</button>
        <button type="button" mat-flat-button [disabled]="busy()" (click)="save()">{{ busy() ? 'Šaljem…' : data.mode === 'submit' ? 'Pošalji na proveru' : 'Sačuvaj' }}</button>
      </ng-container>
    </app-dialog-shell>
  `,
  styles: `
    .facility-group {
      display: grid;
      gap: 8px;
      margin: 0 0 16px;
      padding: 12px;
      border: 1px solid var(--color-border);
      border-radius: 12px;
    }
    .facility-group legend {
      padding: 0 4px;
      font-weight: 700;
    }
    .facility-entry {
      display: grid;
      gap: 8px;
      padding: 8px 12px 12px;
      border-radius: 8px;
      border: 1px solid var(--color-border);
      background: var(--color-surface-alt);
    }
    .facility-entry-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .facility-add {
      justify-self: start;
    }
    mat-form-field {
      width: 100%;
    }
    @media (min-width: 600px) {
      .facility-group,
      .facility-entry {
        grid-template-columns: 1fr 1fr;
      }
      .facility-group legend,
      .facility-entry,
      .facility-entry-head,
      .facility-add {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class FacilityFormDialog {
  protected readonly data = inject<FacilityFormData>(MAT_DIALOG_DATA);
  readonly #http = inject(HttpClient);
  readonly #ref = inject(MatDialogRef<FacilityFormDialog, FacilityFormResult>);

  protected readonly draft = signal<Draft>(this.#initial());
  protected readonly note = signal(typeof this.data.institution.facilities?.napomena === 'string' ? this.data.institution.facilities.napomena : '');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly groups = computed(() => Object.entries(this.data.catalog.groups).map(([key, group]) => ({ key, ...group })));

  protected entries(group: string, list: string): DraftEntry[] {
    const value = this.draft()[group]?.[list];
    return Array.isArray(value) ? value : [];
  }

  protected set(group: string, change: FacilityFieldChange): void {
    this.draft.update((draft) => ({ ...draft, [group]: { ...draft[group], [change.field]: change.value } }));
  }

  protected setEntry(group: string, list: string, index: number, change: FacilityFieldChange): void {
    this.#updateList(group, list, (entries) => entries.map((entry, position) => (position === index ? { ...entry, [change.field]: change.value } : entry)));
  }

  protected add(group: string, list: string): void {
    this.#updateList(group, list, (entries) => [...entries, {}]);
    const count = this.entries(group, list).length;
    const current = this.draft()[group]?.['broj'];
    this.draft.update((draft) => ({ ...draft, [group]: { ...draft[group], ima: true, broj: typeof current === 'number' && current > count ? current : count } }));
  }

  protected remove(group: string, list: string, index: number): void {
    this.#updateList(group, list, (entries) => entries.filter((_, position) => position !== index));
  }

  protected save(): void {
    this.busy.set(true);
    this.error.set(null);
    const facilities: Facilities = {};
    for (const [group, values] of Object.entries(this.draft())) {
      const result: FacilityGroupValues = clean(values);
      const list = this.data.catalog.groups[group]?.list;
      if (list) {
        const entries = this.entries(group, list.key).map(clean).filter((entry) => Object.keys(entry).length);
        if (entries.length) {
          result[list.key] = entries;
        }
      }
      if (Object.keys(result).length) {
        facilities[group] = result;
      }
    }
    if (this.note().trim()) {
      facilities.napomena = this.note().trim();
    }
    const id = this.data.institution.id;
    const request =
      this.data.mode === 'submit'
        ? this.#http.post<{ message: string }>(`${API_URL}/institutions/${id}/facility-submissions`, { facilities }).pipe(map((response): FacilityFormResult => ({ submitted: response.message })))
        : this.#http.put<Institution>(`${API_URL}/admin/institutions/${id}/facilities`, { facilities }).pipe(map((saved): FacilityFormResult => ({ saved })));
    request.subscribe({
      next: (result) => this.#ref.close(result),
      error: (error) => {
        this.busy.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }

  #updateList(group: string, list: string, change: (entries: DraftEntry[]) => DraftEntry[]): void {
    this.draft.update((draft) => ({ ...draft, [group]: { ...draft[group], [list]: change(this.entries(group, list)) } }));
  }

  #initial(): Draft {
    const draft: Draft = {};
    for (const [key, value] of Object.entries(this.data.institution.facilities ?? {})) {
      if (value && typeof value === 'object') {
        draft[key] = Object.fromEntries(Object.entries(value).map(([field, item]) => [field, Array.isArray(item) ? item.map((entry) => ({ ...entry })) : item]));
      }
    }
    return draft;
  }
}
