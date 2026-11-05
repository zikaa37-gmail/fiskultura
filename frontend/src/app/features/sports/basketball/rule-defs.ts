import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-rule-defs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rp-defs', 'aria-hidden': 'true' },
  template: `
    <svg width="0" height="0" focusable="false">
      <defs>
        <g id="rp-ball" class="rp-ball">
          <circle r="7" />
          <path d="M-7 0 H7 M0 -7 V7 M-5 -5 Q0 0 -5 5 M5 -5 Q0 0 5 5" />
        </g>
        <g id="rp-foot" class="rp-foot">
          <ellipse cx="0" cy="0" rx="5" ry="9" />
          <circle cx="0" cy="-13" r="3.2" />
        </g>
        <g id="rp-hoop" class="rp-hoop-group">
          <line class="rp-board" x1="-14" y1="-10" x2="14" y2="-10" />
          <ellipse class="rp-hoop" cx="0" cy="0" rx="9" ry="3.5" />
          <path class="rp-net" d="M-8 1 L-5 12 L5 12 L8 1 M-4 2 L-2 12 M4 2 L2 12" />
        </g>
      </defs>
    </svg>
  `,
})
export class RuleDefs {}
