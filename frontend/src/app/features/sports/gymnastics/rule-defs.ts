import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-gymnastics-rule-defs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rp-defs', 'aria-hidden': 'true' },
  template: `
    <svg width="0" height="0" focusable="false">
      <defs>
        <g id="rp-gy-buck" class="rp-gy-def rp-gy-buck">
          <path d="M-16 16 L-22 68 M16 16 L22 68" />
          <rect x="-24" y="0" width="48" height="16" rx="7" />
        </g>
        <g id="rp-gy-board" class="rp-gy-def rp-gy-board">
          <path d="M-30 0 L30 0 L30 -10 Z" />
        </g>
        <g id="rp-gy-beam" class="rp-gy-def rp-gy-beam">
          <path d="M-70 8 L-70 38 M70 8 L70 38" />
          <rect x="-90" y="0" width="180" height="8" rx="2" />
        </g>
        <g id="rp-gy-ring" class="rp-gy-def rp-gy-ring">
          <circle r="7" />
        </g>
      </defs>
    </svg>
  `,
})
export class GymnasticsRuleDefs {}
