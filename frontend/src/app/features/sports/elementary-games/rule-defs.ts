import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-elementary-games-rule-defs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rp-defs', 'aria-hidden': 'true' },
  template: `
    <svg width="0" height="0" focusable="false">
      <defs>
        <g id="rp-eg-ball" class="rp-ball rp-eg-ball">
          <circle r="7" />
          <path d="M-7 0 H7 M0 -7 Q-4 0 0 7 M0 -7 Q4 0 0 7" />
        </g>
        <g id="rp-eg-cone" class="rp-eg-cone rp-eg-prop">
          <path d="M-6 0 L-2 -16 H2 L6 0 Z" />
          <rect x="-9" y="-2" width="18" height="3" rx="1" />
        </g>
      </defs>
    </svg>
  `,
})
export class ElementaryGamesRuleDefs {}
