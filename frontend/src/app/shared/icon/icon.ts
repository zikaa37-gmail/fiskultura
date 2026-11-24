import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export const ICON_NAMES = [
  'dumbbell',
  'clipboard',
  'chart',
  'globe',
  'trophy',
  'heart',
  'news',
  'people',
  'book',
  'checklist',
  'mail',
  'phone',
  'pin',
  'ball',
  'pdf',
  'external',
  'menu',
  'close',
  'logout',
  'user',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'chevrons-left',
  'chevrons-right',
  'web',
  'facebook',
  'instagram',
  'youtube',
  'link',
  'check',
  'arrow-left',
  'arrow-right',
  'arrow-up',
  'star',
  'help',
  'more-vert',
  'eye',
  'edit',
  'trash',
  'ban',
  'bell',
  'alert-triangle',
  'apps',
  'calendar-range',
  'calendar',
  'check-circle',
  'chevron-up',
  'clock',
  'copy',
  'credit-card',
  'download',
  'file-search',
  'folder-open',
  'home',
  'info',
  'invoice',
  'key',
  'lock',
  'minus-circle',
  'money',
  'plus-circle',
  'plus',
  'search',
  'settings',
  'shopping-bag',
  'sun',
  'support',
  'tag',
  'upload',
  'x-circle',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-icon',
    'aria-hidden': 'true',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[style.--icon-url]': 'url()',
  },
  template: '',
  styles: `
    :host {
      display: inline-block;
      flex: none;
      background-color: currentColor;
      -webkit-mask: var(--icon-url) center / contain no-repeat;
      mask: var(--icon-url) center / contain no-repeat;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(24);
  protected readonly url = computed(() => `url(/icons/${this.name()}.svg)`);
}
