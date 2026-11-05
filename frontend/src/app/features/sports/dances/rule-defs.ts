import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dances-rule-defs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rp-defs', 'aria-hidden': 'true' },
  template: `
    <svg width="0" height="0" focusable="false">
      <defs>
        <g id="rp-da-foot-r" class="rp-foot rp-da-foot rp-da-foot-r">
          <ellipse cx="0" cy="0" rx="5" ry="9" />
          <circle cx="0" cy="-13" r="3.2" />
        </g>
        <g id="rp-da-foot-l" class="rp-foot rp-da-foot rp-da-foot-l">
          <ellipse cx="0" cy="0" rx="5" ry="9" />
          <circle cx="0" cy="-13" r="3.2" />
        </g>
        <g id="rp-da-toe-r" class="rp-foot rp-da-foot rp-da-foot-r">
          <ellipse cx="0" cy="-4" rx="4.6" ry="5.4" />
          <circle cx="0" cy="-13" r="3.2" />
        </g>
        <g id="rp-da-toe-l" class="rp-foot rp-da-foot rp-da-foot-l">
          <ellipse cx="0" cy="-4" rx="4.6" ry="5.4" />
          <circle cx="0" cy="-13" r="3.2" />
        </g>
        <g id="rp-da-note" class="rp-da-note">
          <ellipse cx="0" cy="0" rx="6" ry="4.4" transform="rotate(-20)" />
          <path d="M5.4 -1.6 V-26 Q12 -22 14 -14" />
        </g>
      </defs>
    </svg>
  `,
})
export class DancesRuleDefs {}
