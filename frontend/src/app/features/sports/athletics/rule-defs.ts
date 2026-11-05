import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-athletics-rule-defs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rp-defs', 'aria-hidden': 'true' },
  template: `
    <svg width="0" height="0" focusable="false">
      <defs>
        <g id="rp-at-baton" class="rp-at-def rp-at-baton">
          <rect x="-10" y="-3" width="20" height="6" rx="3" />
        </g>
        <g id="rp-at-shot" class="rp-at-def rp-at-shot">
          <circle r="7" />
        </g>
        <g id="rp-at-ball" class="rp-at-def rp-at-ball">
          <circle r="5" />
        </g>
        <g id="rp-at-foot" class="rp-foot">
          <ellipse cx="0" cy="0" rx="5" ry="9" />
          <circle cx="0" cy="-13" r="3.2" />
        </g>
        <g id="rp-at-crouch-marks" class="rp-figure rp-figure-us">
          <g class="rp-legs">
            <polyline points="-38,-28 -18,-14 -30,-2" />
            <polyline points="-38,-28 -44,-3 -62,-6" />
          </g>
          <path class="rp-torso" d="M-2 -34 L-38 -36 L-40 -22 L-6 -20 Z" />
          <g class="rp-arm">
            <line x1="-4" y1="-28" x2="-4" y2="-3" />
          </g>
          <g class="rp-hand">
            <circle cx="-4" cy="-3" r="4" />
          </g>
          <circle class="rp-head" cx="6" cy="-28" r="9" />
        </g>
        <g id="rp-at-crouch-set" class="rp-figure rp-figure-us">
          <g class="rp-legs">
            <polyline points="-36,-42 -16,-24 -30,-2" />
            <polyline points="-36,-42 -52,-22 -62,-6" />
          </g>
          <path class="rp-torso" d="M-2 -36 L-36 -48 L-38 -34 L-6 -24 Z" />
          <g class="rp-arm">
            <line x1="-4" y1="-30" x2="-4" y2="-3" />
          </g>
          <g class="rp-hand">
            <circle cx="-4" cy="-3" r="4" />
          </g>
          <circle class="rp-head" cx="6" cy="-32" r="9" />
        </g>
      </defs>
    </svg>
  `,
})
export class AthleticsRuleDefs {}
