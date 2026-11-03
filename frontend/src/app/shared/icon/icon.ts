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
  | 'close';

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
  ball: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8', 'M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8', 'M3 12h18'],
  pdf: ['M7 3h7l5 5v13H7z', 'M14 3v5h5', 'M10 13h6', 'M10 17h4'],
  external: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v6H4V6h6'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
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
