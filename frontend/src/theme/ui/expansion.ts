import { Directive, input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { ControlSize } from './button';

@Directive({
  selector: 'mat-expansion-panel',
  host: {
    class: 'app-panel',
    '[class.panel-size-xs]': "size() === 'xs'",
    '[class.panel-size-sm]': "size() === 'sm'",
    '[class.panel-size-md]': "size() === 'md'",
    '[class.panel-size-lg]': "size() === 'lg'",
    '[class.panel-size-xl]': "size() === 'xl'",
  },
})
export class AppExpansionPanel {
  readonly size = input<ControlSize>('lg');
}

export const EXPANSION_IMPORTS = [MatExpansionModule, AppExpansionPanel] as const;
