import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-volleyball-rule-defs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rp-defs', 'aria-hidden': 'true' },
  template: `
    <svg width="0" height="0" focusable="false">
      <defs>
        <g id="rp-vb-ball" class="rp-ball rp-vb-ball">
          <circle r="7" />
          <path d="M-6.6 -2.2 Q0 -1 5.4 -4.4 M-3.2 6.2 Q-1.4 0 -6.6 -2.2 M5.4 -4.4 Q2.6 2 6.4 3" />
        </g>
        <g id="rp-vb-foot" class="rp-foot">
          <ellipse cx="0" cy="0" rx="5" ry="9" />
          <circle cx="0" cy="-13" r="3.2" />
        </g>
      </defs>
    </svg>
  `,
})
export class VolleyballRuleDefs {}
