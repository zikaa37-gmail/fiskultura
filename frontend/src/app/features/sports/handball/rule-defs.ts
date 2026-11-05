import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-handball-rule-defs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rp-defs', 'aria-hidden': 'true' },
  template: `
    <svg width="0" height="0" focusable="false">
      <defs>
        <g id="rp-hb-ball" class="rp-ball rp-hb-ball">
          <circle r="7" />
          <path d="M0 -7 V-2.5 M0 -2.5 L-4.3 0.8 M0 -2.5 L4.3 0.8 M-4.3 0.8 L-2.7 5.6 M4.3 0.8 L2.7 5.6 M-2.7 5.6 H2.7 M-4.3 0.8 L-6.8 -1.4 M4.3 0.8 L6.8 -1.4" />
        </g>
        <g id="rp-hb-foot" class="rp-foot">
          <ellipse cx="0" cy="0" rx="5" ry="9" />
          <circle cx="0" cy="-13" r="3.2" />
        </g>
        <clipPath id="rp-hb-court-clip">
          <rect x="20" y="30" width="200" height="100" />
        </clipPath>
        <g id="rp-hb-goal" class="rp-hb-goal">
          <path class="rp-hb-goal-net" d="M-30 0 V-40 H30 V0 M-20 -40 V0 M-10 -40 V0 M0 -40 V0 M10 -40 V0 M20 -40 V0 M-30 -30 H30 M-30 -20 H30 M-30 -10 H30" />
          <path class="rp-hb-goal-frame" d="M-30 0 V-40 H30 V0" />
        </g>
      </defs>
    </svg>
  `,
})
export class HandballRuleDefs {}
