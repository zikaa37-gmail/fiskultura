import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Organization } from '../../core/content/content.model';
import { API_URL } from '../../core/http/api';
import { NEWS_CATEGORY_LABELS, NewsCategory } from '../news/news.model';
import { FREQUENCY_OPTIONS, SubscriptionFrequency } from './subscription.model';

@Component({
  selector: 'app-subscription-fields',
  imports: [FormsModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatRadioModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: 8px;
      min-width: 0;
    }
    mat-form-field {
      width: 100%;
    }
    .choice-list {
      display: grid;
      gap: 8px;
      margin: 0 0 8px;
    }
    .choice {
      display: block;
      padding: 8px 8px 8px 0;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
    }
    .choice-hint {
      display: block;
      margin: 0 12px 0 40px;
      font-size: 14px;
    }
    fieldset {
      margin: 0;
      padding: 0;
      border: 0;
      min-width: 0;
    }
    legend {
      margin-bottom: 8px;
      font-weight: 700;
    }
    .chip-row.choice-chips {
      flex-wrap: wrap;
      overflow: visible;
      margin: 0 0 16px;
      padding: 0;
    }
  `,
  template: `
    <fieldset>
      <legend>Koliko često</legend>
      <mat-radio-group class="choice-list" name="frequency" [ngModel]="frequency()" (ngModelChange)="frequency.set($event)">
        @for (option of frequencyOptions; track option.value) {
          <label class="choice">
            <mat-radio-button [value]="option.value">{{ option.label }}</mat-radio-button>
            <span class="choice-hint muted">{{ option.hint }}</span>
          </label>
        }
      </mat-radio-group>
    </fieldset>

    <fieldset>
      <legend>Šta pratite</legend>
      <div class="chip-row choice-chips">
        <button type="button" [matButton]="categories().length === 0 ? 'filled' : 'outlined'" [theme]="categories().length === 0 ? 'primary' : 'tertiary'" size="md" [attr.aria-pressed]="categories().length === 0" (click)="categories.set([])">Sve</button>
        @for (category of categoryOptions; track category) {
          <button type="button" [matButton]="categories().includes(category) ? 'filled' : 'outlined'" [theme]="categories().includes(category) ? 'primary' : 'tertiary'" size="md" [attr.aria-pressed]="categories().includes(category)" (click)="toggleCategory(category)">
            {{ categoryLabels[category] }}
          </button>
        }
      </div>
    </fieldset>

    <mat-form-field appearance="outline" subscriptSizing="dynamic">
      <mat-label>Udruženja</mat-label>
      <mat-select multiple name="organizations" [ngModel]="organizationIds()" (ngModelChange)="organizationIds.set($event)" placeholder="Sva udruženja">
        @for (organization of organizations(); track organization.id) {
          <mat-option [value]="organization.id">{{ organization.short_name || organization.name }}</mat-option>
        }
      </mat-select>
      <mat-hint>Prazno = sva udruženja. Vesti samog portala stižu uvek.</mat-hint>
    </mat-form-field>
  `,
})
export class SubscriptionFields {
  readonly frequency = model.required<SubscriptionFrequency>();
  readonly categories = model.required<NewsCategory[]>();
  readonly organizationIds = model.required<number[]>();

  protected readonly frequencyOptions = FREQUENCY_OPTIONS;
  protected readonly categoryLabels = NEWS_CATEGORY_LABELS;
  protected readonly categoryOptions = Object.keys(NEWS_CATEGORY_LABELS) as NewsCategory[];

  readonly #organizations = httpResource<Organization[]>(() => `${API_URL}/organizations`);
  protected readonly organizations = computed(() =>
    [...(this.#organizations.hasValue() ? this.#organizations.value() : [])].sort((a, b) => (a.short_name || a.name).localeCompare(b.short_name || b.name, 'sr')),
  );

  protected toggleCategory(category: NewsCategory): void {
    this.categories.update((list) => (list.includes(category) ? list.filter((item) => item !== category) : [...list, category]));
  }
}
