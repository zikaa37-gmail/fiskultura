import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon, IconName } from '../../app/shared/icon/icon';
import { ControlSize } from './button';

export type IconButtonTheme = 'neutral' | 'primary' | 'accent' | 'danger' | 'ghost';

const ICON_SIZES: Record<ControlSize, number> = { xs: 14, sm: 16, md: 20, lg: 22, xl: 24 };

@Component({
  selector: 'button[app-icon-button], a[app-icon-button]',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-icon-button',
    '[class]': "'icon-btn-' + theme() + ' icon-btn-size-' + size()",
    '[attr.aria-label]': 'label()',
    '[attr.title]': 'label()',
  },
  template: `<app-icon [name]="icon()" [size]="iconSize()" />`,
})
export class AppIconButton {
  readonly icon = input.required<IconName>();
  readonly label = input.required<string>();
  readonly theme = input<IconButtonTheme>('neutral');
  readonly size = input<ControlSize>('md');
  protected readonly iconSize = computed(() => ICON_SIZES[this.size()]);
}

export const ICON_BUTTON_IMPORTS = [AppIconButton] as const;
