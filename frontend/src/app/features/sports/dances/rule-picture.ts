import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RuleFigure } from '../basketball/rule-figure';
import { DancesPicture } from './rules-content';

@Component({
  selector: 'app-dances-rule-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RuleFigure],
  host: { class: 'rule-picture' },
  templateUrl: './rule-picture.html',
})
export class DancesRulePicture {
  readonly name = input.required<DancesPicture>();
  readonly label = input('');

  readonly koloLine = [40, 80, 120, 160, 200];
  readonly koloRing = [0, 45, 90, 135, 180, 225, 270, 315].map((angle) => ({
    x: 120 + 52 * Math.cos((angle * Math.PI) / 180),
    y: 84 + 40 * Math.sin((angle * Math.PI) / 180),
  }));
  readonly turnSteps = [1, 2, 3, 4, 5, 6].map((step) => ({
    step,
    x: 120 + 46 * Math.cos(((step * 60 + 30) * Math.PI) / 180),
    y: 86 + 46 * Math.sin(((step * 60 + 30) * Math.PI) / 180),
    nx: 120 + 66 * Math.cos(((step * 60 + 30) * Math.PI) / 180),
    ny: 88 + 62 * Math.sin(((step * 60 + 30) * Math.PI) / 180),
    rotate: step * 60 + 210,
    right: step % 2 === 1,
  }));
}
