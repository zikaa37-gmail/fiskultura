import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { QUESTION_CATEGORY_LABELS, QuestionCategory } from './question.model';

export type QuestionForm = FormGroup<{
  category: FormControl<QuestionCategory>;
  title: FormControl<string>;
  body: FormControl<string>;
}>;

export function createQuestionForm(builder: NonNullableFormBuilder): QuestionForm {
  return builder.group({
    category: ['ostalo' as QuestionCategory, Validators.required],
    title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    body: ['', Validators.maxLength(3000)],
  });
}

export function questionPayload(form: QuestionForm): { category: QuestionCategory; title: string; body: string | null } {
  const value = form.getRawValue();
  return { ...value, body: value.body.trim() || null };
}

@Component({
  selector: 'app-question-fields',
  imports: [ReactiveFormsModule, FORM_FIELD_IMPORTS, MatInputModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: grid;
      gap: 4px;
      min-width: 0;
    }
    mat-form-field {
      width: 100%;
    }
  `,
  template: `
    <ng-container [formGroup]="form()">
      <mat-form-field appearance="outline">
        <mat-label>Oblast</mat-label>
        <mat-select formControlName="category">
          @for (option of categories; track option) {
            <mat-option [value]="option">{{ categoryLabels[option] }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Pitanje ukratko</mat-label>
        <input matInput formControlName="title" maxlength="200" placeholder="npr. Da li se sekcija računa u normu?" />
        <mat-hint align="end">{{ form().controls.title.value.length }}/200</mat-hint>
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Više detalja (nije obavezno)</mat-label>
        <textarea matInput formControlName="body" rows="5" maxlength="3000"></textarea>
        <mat-hint>Ne upisujte imena učenika ni druge lične podatke.</mat-hint>
      </mat-form-field>
    </ng-container>
  `,
})
export class QuestionFields {
  readonly form = input.required<QuestionForm>();

  protected readonly categoryLabels = QUESTION_CATEGORY_LABELS;
  protected readonly categories = Object.keys(QUESTION_CATEGORY_LABELS) as QuestionCategory[];
}
