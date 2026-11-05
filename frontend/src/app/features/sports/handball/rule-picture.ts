import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RuleFigure } from '../basketball/rule-figure';
import { HandballPicture } from './rules-content';

const FULL_SCALE = 5;
const FULL_LEFT = 20;
const FULL_RIGHT = 220;
const FULL_MID_Y = 80;
const ZOOM_SCALE = 10;
const ZOOM_GOAL_X = 20;
const ZOOM_MID_Y = 80;

function goalAreaPath(goalX: number, midY: number, scale: number, radiusMetres: number, direction: 1 | -1): string {
  const radius = radiusMetres * scale;
  const postTop = midY - 1.5 * scale;
  const postBottom = midY + 1.5 * scale;
  const sweep = direction === 1 ? 1 : 0;
  const front = goalX + direction * radius;
  return `M${goalX} ${postTop - radius} A${radius} ${radius} 0 0 ${sweep} ${front} ${postTop} V${postBottom} A${radius} ${radius} 0 0 ${sweep} ${goalX} ${postBottom + radius}`;
}

@Component({
  selector: 'app-handball-rule-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RuleFigure],
  host: { class: 'rule-picture' },
  templateUrl: './rule-picture.html',
})
export class HandballRulePicture {
  readonly name = input.required<HandballPicture>();
  readonly label = input('');

  readonly full = {
    leftArea: goalAreaPath(FULL_LEFT, FULL_MID_Y, FULL_SCALE, 6, 1),
    rightArea: goalAreaPath(FULL_RIGHT, FULL_MID_Y, FULL_SCALE, 6, -1),
    leftFree: goalAreaPath(FULL_LEFT, FULL_MID_Y, FULL_SCALE, 9, 1),
    rightFree: goalAreaPath(FULL_RIGHT, FULL_MID_Y, FULL_SCALE, 9, -1),
    leftSeven: FULL_LEFT + 7 * FULL_SCALE,
    rightSeven: FULL_RIGHT - 7 * FULL_SCALE,
    postTop: FULL_MID_Y - 1.5 * FULL_SCALE,
    postBottom: FULL_MID_Y + 1.5 * FULL_SCALE,
  };

  readonly passes = [
    { number: 1, x1: 28, y1: 86, x2: 62, y2: 46 },
    { number: 2, x1: 78, y1: 46, x2: 112, y2: 86 },
    { number: 3, x1: 128, y1: 86, x2: 162, y2: 46 },
    { number: 4, x1: 178, y1: 46, x2: 212, y2: 86 },
  ];

  readonly zoom = {
    area: goalAreaPath(ZOOM_GOAL_X, ZOOM_MID_Y, ZOOM_SCALE, 6, 1),
    free: goalAreaPath(ZOOM_GOAL_X, ZOOM_MID_Y, ZOOM_SCALE, 9, 1),
    seven: ZOOM_GOAL_X + 7 * ZOOM_SCALE,
    four: ZOOM_GOAL_X + 4 * ZOOM_SCALE,
    six: ZOOM_GOAL_X + 6 * ZOOM_SCALE,
    nine: ZOOM_GOAL_X + 9 * ZOOM_SCALE,
    postTop: ZOOM_MID_Y - 1.5 * ZOOM_SCALE,
    postBottom: ZOOM_MID_Y + 1.5 * ZOOM_SCALE,
  };
}
