import { Directive, input } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ControlSize } from './button';

@Directive({
  selector: 'mat-slide-toggle',
  host: {
    class: 'app-toggle',
    '[class.toggle-size-xs]': "size() === 'xs'",
    '[class.toggle-size-sm]': "size() === 'sm'",
    '[class.toggle-size-md]': "size() === 'md'",
    '[class.toggle-size-lg]': "size() === 'lg'",
    '[class.toggle-size-xl]': "size() === 'xl'",
  },
})
export class AppToggle {
  readonly size = input<ControlSize>('md');
}

export const TOGGLE_IMPORTS = [MatSlideToggleModule, AppToggle] as const;
