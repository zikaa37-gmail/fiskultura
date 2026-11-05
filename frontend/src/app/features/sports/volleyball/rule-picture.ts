import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RuleFigure } from '../basketball/rule-figure';
import { VolleyballPicture } from './rules-content';

@Component({
  selector: 'app-volleyball-rule-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RuleFigure],
  host: { class: 'rule-picture' },
  templateUrl: './rule-picture.html',
})
export class VolleyballRulePicture {
  readonly name = input.required<VolleyballPicture>();
  readonly label = input('');

  readonly rotationSpots = [
    { position: 1, x: 190, y: 51 },
    { position: 6, x: 190, y: 81 },
    { position: 5, x: 190, y: 111 },
    { position: 4, x: 138, y: 111 },
    { position: 3, x: 138, y: 81 },
    { position: 2, x: 138, y: 51 },
  ];
}
