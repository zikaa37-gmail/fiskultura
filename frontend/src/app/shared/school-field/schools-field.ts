import { ChangeDetectionStrategy, Component, model, output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { UserSchool } from '../../core/auth/user.model';
import { Institution } from '../../features/community/institution.model';
import { Icon } from '../icon/icon';
import { SchoolField } from './school-field';

const MAX_SCHOOLS = 6;

@Component({
  selector: 'app-schools-field',
  imports: [MatInputModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, Icon, SchoolField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="schools">
      @for (school of rows(); track $index) {
        <div class="school-row">
          <app-school-field
            [label]="rows().length > 1 ? 'Škola ili fakultet ' + ($index + 1) : 'Škola ili fakultet'"
            [hint]="$index === 0 ? 'Izaberite sa spiska da biste mogli da upisujete podatke o infrastrukturi škole.' : ''"
            [value]="school.name"
            (valueChange)="rename($index, $event)"
            (picked)="pick($index, $event)"
          />
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="share-field">
            <mat-label>Angažovanje %</mat-label>
            <input
              matInput
              type="number"
              min="1"
              max="100"
              step="1"
              inputmode="numeric"
              [value]="school.share"
              (keydown)="guard($event)"
              (input)="share($index, $any($event.target))"
            />
          </mat-form-field>
          @if (rows().length > 1 || school.name) {
            <button type="button" mat-icon-button class="remove" [attr.aria-label]="'Ukloni školu ' + ($index + 1)" (click)="remove($index)">
              <app-icon name="trash" [size]="18" />
            </button>
          }
        </div>
      }
      @if (rows().length < max && rows().at(-1)?.name) {
        <button type="button" mat-stroked-button theme="tertiary" size="sm" class="add" (click)="add()">Radim i u drugoj školi</button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .schools {
      display: grid;
      gap: 12px;
    }
    .school-row {
      display: grid;
      grid-template-columns: 1fr 112px 44px;
      gap: 8px;
      align-items: start;
    }
    .school-row app-school-field {
      grid-column: 1 / -1;
    }
    .share-field {
      grid-column: 1 / 2;
      max-width: 160px;
    }
    .remove {
      grid-column: 3;
      grid-row: 2;
      width: 44px;
      height: 44px;
      color: var(--color-muted);
    }
    .add {
      justify-self: start;
    }
    @media (min-width: 600px) {
      .school-row {
        grid-template-columns: 1fr 140px 44px;
      }
      .school-row app-school-field {
        grid-column: 1;
      }
      .share-field {
        grid-column: 2;
        max-width: none;
      }
      .remove {
        grid-row: 1;
      }
    }
  `,
})
export class SchoolsField {
  readonly value = model<UserSchool[]>([]);
  readonly picked = output<Institution>();
  protected readonly max = MAX_SCHOOLS;

  protected rows(): UserSchool[] {
    const rows = this.value();
    return rows.length ? rows : [{ institution_id: null, name: '', share: 100 }];
  }

  protected rename(index: number, name: string): void {
    this.#update(index, { name, institution_id: null });
  }

  protected pick(index: number, item: Institution): void {
    this.#update(index, { name: item.label, institution_id: item.id });
    this.picked.emit(item);
  }

  protected share(index: number, target: HTMLInputElement): void {
    if (target.value === '') return;
    const share = Math.min(100, Math.max(1, Math.trunc(Number(target.value)) || 100));
    if (String(share) !== target.value) {
      target.value = String(share);
    }
    this.#update(index, { share });
  }

  protected guard(event: KeyboardEvent): void {
    if (['.', ',', 'e', 'E', '-', '+'].includes(event.key)) {
      event.preventDefault();
    }
  }

  protected add(): void {
    this.value.set([...this.rows(), { institution_id: null, name: '', share: 100 }]);
  }

  protected remove(index: number): void {
    this.value.set(this.rows().filter((_, position) => position !== index));
  }

  #update(index: number, change: Partial<UserSchool>): void {
    this.value.set(this.rows().map((row, position) => (position === index ? { ...row, ...change } : row)));
  }
}

export function cleanSchools(schools: UserSchool[]): UserSchool[] {
  return schools.map((school) => ({ ...school, name: school.name.trim() })).filter((school) => school.name);
}
