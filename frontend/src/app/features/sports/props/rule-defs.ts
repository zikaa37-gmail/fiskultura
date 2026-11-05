import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-props-rule-defs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rp-defs', 'aria-hidden': 'true' },
  template: `
    <svg width="0" height="0" focusable="false">
      <defs>
        <g id="rp-pr-ball" class="rp-pr-def rp-pr-ball">
          <circle r="7" />
          <path d="M-4.6 -2.8 A5 5 0 0 1 -1.4 -5" />
        </g>
        <g id="rp-pr-med" class="rp-pr-def rp-pr-med">
          <circle r="7" />
          <path d="M-7 0 H7 M0 -7 Q-3.4 0 0 7 M0 -7 Q3.4 0 0 7" />
        </g>
        <g id="rp-pr-cone" class="rp-pr-def rp-pr-cone">
          <path d="M-7 0 L-2.4 -18 H2.4 L7 0 Z" />
          <rect x="-10" y="-2" width="20" height="3" rx="1.5" />
          <path class="rp-pr-cone-stripe" d="M-4.6 -9 H4.6" />
        </g>
      </defs>
    </svg>
  `,
})
export class PropsRuleDefs {}
