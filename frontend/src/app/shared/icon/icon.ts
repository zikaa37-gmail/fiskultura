import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconName =
  | 'dumbbell'
  | 'clipboard'
  | 'chart'
  | 'globe'
  | 'trophy'
  | 'heart'
  | 'news'
  | 'people'
  | 'book'
  | 'checklist'
  | 'mail'
  | 'ball'
  | 'pdf'
  | 'external'
  | 'menu'
  | 'close'
  | 'web'
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'link'
  | 'check'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'star'
  | 'help'
  | 'phone'
  | 'pin';

const ICON_PATHS: Record<IconName, string[]> = {
  dumbbell: ['M6.5 6.5l11 11', 'M3 10l7-7', 'M14 21l7-7', 'M5 12l7-7', 'M12 19l7-7'],
  clipboard: ['M9 4h6l1 2h3v15H5V6h3z', 'M9 12h6', 'M9 16h4'],
  chart: ['M3 20h18', 'M6 16v-5', 'M11 16V7', 'M16 16v-8', 'M21 16v-3'],
  globe: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M3 12h18', 'M12 3a14 14 0 0 1 0 18', 'M12 3a14 14 0 0 0 0 18'],
  trophy: ['M8 21h8', 'M12 17v4', 'M7 4h10v5a5 5 0 0 1-10 0z', 'M7 6H4a3 3 0 0 0 3 4', 'M17 6h3a3 3 0 0 1-3 4'],
  heart: ['M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z'],
  news: ['M4 5h13v14H6a2 2 0 0 1-2-2z', 'M17 9h3v8a2 2 0 0 1-2 2h-1', 'M7 9h7', 'M7 13h7', 'M7 16h4'],
  people: ['M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7z', 'M2.5 20a6.5 6.5 0 0 1 13 0', 'M16 4.5a3.5 3.5 0 0 1 0 6.5', 'M18 14a6 6 0 0 1 3.5 6'],
  book: ['M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z', 'M4 19a2 2 0 0 1 2-2h13', 'M9 7h6'],
  checklist: ['M4 6l1.5 1.5L8 5', 'M4 12l1.5 1.5L8 11', 'M4 18l1.5 1.5L8 17', 'M11 6h9', 'M11 12h9', 'M11 18h9'],
  mail: ['M3 6h18v12H3z', 'M3 7l9 6l9-6'],
  phone: ['M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2'],
  pin: ['M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z', 'M9.5 9.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0'],
  ball: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8', 'M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8', 'M3 12h18'],
  pdf: ['M7 3h7l5 5v13H7z', 'M14 3v5h5', 'M10 13h6', 'M10 17h4'],
  external: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v6H4V6h6'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  web: ['M3 5h18v14H3z', 'M3 9h18', 'M6 7h.01', 'M8.5 7h.01', 'M8 13h8', 'M8 16h5'],
  facebook: ['M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H7v3h2v9h3v-9h2.5l.5-3h-3V7a1 1 0 0 1 1-1h2z'],
  instagram: ['M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z', 'M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7z', 'M17.5 6.5h.01'],
  youtube: ['M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z', 'M10 9l5 3-5 3z'],
  link: ['M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1', 'M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1'],
  check: ['M5 12l5 5L20 7'],
  'arrow-left': ['M19 12H5', 'M11 6l-6 6l6 6'],
  'arrow-right': ['M5 12h14', 'M13 6l6 6l-6 6'],
  'arrow-up': ['M12 19V5', 'M6 11l6-6l6 6'],
  star: ['M12 3l2.8 5.7l6.2.9l-4.5 4.4l1.1 6.2L12 17.3l-5.6 2.9l1.1-6.2L3 9.6l6.2-.9z'],
  help: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6', 'M12 17h.01'],
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-icon', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" [attr.width]="size()" [attr.height]="size()">
      @for (path of paths(); track $index) {
        <path [attr.d]="path" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    svg {
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(24);
  protected readonly paths = computed(() => ICON_PATHS[this.name()]);
}
