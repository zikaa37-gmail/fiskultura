import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-futsal-rule-defs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rp-defs', 'aria-hidden': 'true' },
  template: `
    <svg width="0" height="0" focusable="false">
      <defs>
        <g id="rp-fs-ball" class="rp-ball rp-fs-ball">
          <circle r="7" />
          <path class="rp-fs-patch" d="M0 -2.6 L2.5 -0.8 L1.5 2.1 L-1.5 2.1 L-2.5 -0.8 Z" />
          <path d="M0 -2.6 V-7 M2.5 -0.8 L6.6 -2.2 M1.5 2.1 L4 5.7 M-1.5 2.1 L-4 5.7 M-2.5 -0.8 L-6.6 -2.2" />
        </g>
        <g id="rp-fs-foot" class="rp-foot">
          <ellipse cx="0" cy="0" rx="5" ry="9" />
          <circle cx="0" cy="-13" r="3.2" />
        </g>
        <g id="rp-fs-goal" class="rp-fs-goal">
          <path class="rp-fs-goal-net" d="M-30 0 V-40 H30 V0 M-20 -40 V0 M-10 -40 V0 M0 -40 V0 M10 -40 V0 M20 -40 V0 M-30 -30 H30 M-30 -20 H30 M-30 -10 H30" />
          <path class="rp-fs-goal-frame" d="M-30 0 V-40 H30 V0" />
        </g>
      </defs>
    </svg>
  `,
})
export class FutsalRuleDefs {}
