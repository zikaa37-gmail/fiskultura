import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RuleFigure } from '../basketball/rule-figure';
import { FutsalPicture } from './rules-content';

const FULL_SCALE = 5;
const FULL_LEFT = 20;
const FULL_RIGHT = 220;
const FULL_MID_Y = 80;
const ZOOM_SCALE = 10;
const ZOOM_GOAL_X = 20;
const ZOOM_MID_Y = 80;
const AREA_HALF_WIDTH = 1.58;

function penaltyAreaPath(goalX: number, midY: number, scale: number, direction: 1 | -1): string {
  const radius = 6 * scale;
  const top = midY - AREA_HALF_WIDTH * scale;
  const bottom = midY + AREA_HALF_WIDTH * scale;
  const sweep = direction === 1 ? 1 : 0;
  const front = goalX + direction * radius;
  return `M${goalX} ${top - radius} A${radius} ${radius} 0 0 ${sweep} ${front} ${top} V${bottom} A${radius} ${radius} 0 0 ${sweep} ${goalX} ${bottom + radius}`;
}

@Component({
  selector: 'app-futsal-rule-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RuleFigure],
  host: { class: 'rule-picture' },
  templateUrl: './rule-picture.html',
})
export class FutsalRulePicture {
  readonly name = input.required<FutsalPicture>();
  readonly label = input('');

  readonly full = {
    leftArea: penaltyAreaPath(FULL_LEFT, FULL_MID_Y, FULL_SCALE, 1),
    rightArea: penaltyAreaPath(FULL_RIGHT, FULL_MID_Y, FULL_SCALE, -1),
    leftPenalty: FULL_LEFT + 6 * FULL_SCALE,
    rightPenalty: FULL_RIGHT - 6 * FULL_SCALE,
    leftTen: FULL_LEFT + 10 * FULL_SCALE,
    rightTen: FULL_RIGHT - 10 * FULL_SCALE,
    postTop: FULL_MID_Y - 1.5 * FULL_SCALE,
    postBottom: FULL_MID_Y + 1.5 * FULL_SCALE,
    centreRadius: 3 * FULL_SCALE,
  };

  readonly zoom = {
    area: penaltyAreaPath(ZOOM_GOAL_X, ZOOM_MID_Y, ZOOM_SCALE, 1),
    penalty: ZOOM_GOAL_X + 6 * ZOOM_SCALE,
    ten: ZOOM_GOAL_X + 10 * ZOOM_SCALE,
    postTop: ZOOM_MID_Y - 1.5 * ZOOM_SCALE,
    postBottom: ZOOM_MID_Y + 1.5 * ZOOM_SCALE,
  };

  readonly fouls = [1, 2, 3, 4, 5];
}
