import { Directive, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ControlSize } from './button';

@Directive({
  selector: 'mat-form-field',
  host: {
    class: 'app-field',
    '[class.field-size-xs]': "size() === 'xs'",
    '[class.field-size-sm]': "size() === 'sm'",
    '[class.field-size-md]': "size() === 'md'",
    '[class.field-size-lg]': "size() === 'lg'",
    '[class.field-size-xl]': "size() === 'xl'",
  },
})
export class AppFormField {
  readonly size = input<ControlSize>('md');
}

export const FORM_FIELD_IMPORTS = [MatFormFieldModule, AppFormField] as const;
