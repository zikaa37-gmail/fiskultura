import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RuleFigure } from '../basketball/rule-figure';
import { AthleticsPicture } from './rules-content';

@Component({
  selector: 'app-athletics-rule-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RuleFigure],
  host: { class: 'rule-picture' },
  templateUrl: './rule-picture.html',
})
export class AthleticsRulePicture {
  readonly name = input.required<AthleticsPicture>();
  readonly label = input('');

  readonly laneLines = [40, 64, 88, 112, 136];
  readonly laneRunners = [
    { lane: 1, x: 70, y: 52 },
    { lane: 2, x: 92, y: 76 },
    { lane: 3, x: 64, y: 100 },
    { lane: 4, x: 84, y: 124 },
  ];
  readonly gameKids = [140, 175, 210];
  readonly relayRunners = [45, 95, 145, 195];
  readonly zoneRunners = [
    { no: 1, x: 86 },
    { no: 2, x: 116 },
  ];
  readonly threeFails = [
    { no: 1, x: 70 },
    { no: 2, x: 120 },
    { no: 3, x: 170 },
  ];
  readonly bestRows = [
    { no: 1, y: 50, width: 110 },
    { no: 2, y: 80, width: 0 },
    { no: 3, y: 110, width: 140 },
  ];
}
