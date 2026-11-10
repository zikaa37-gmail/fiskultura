import { Directive, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

export type ButtonTheme = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ControlSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonSize = ControlSize;

@Directive({
  selector: '[mat-button], [mat-flat-button], [mat-stroked-button], [mat-raised-button], [matButton]',
  host: {
    class: 'app-btn',
    '[class.btn-theme-primary]': "theme() === 'primary'",
    '[class.btn-theme-secondary]': "theme() === 'secondary'",
    '[class.btn-theme-tertiary]': "theme() === 'tertiary'",
    '[class.btn-theme-danger]': "theme() === 'danger'",
    '[class.btn-size-xs]': "size() === 'xs'",
    '[class.btn-size-sm]': "size() === 'sm'",
    '[class.btn-size-md]': "size() === 'md'",
    '[class.btn-size-lg]': "size() === 'lg'",
    '[class.btn-size-xl]': "size() === 'xl'",
  },
})
export class AppButton {
  readonly theme = input<ButtonTheme>('primary');
  readonly size = input<ButtonSize>('md');
}

export const BUTTON_IMPORTS = [MatButtonModule, AppButton] as const;
