import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RuleFigure } from '../sports/basketball/rule-figure';
import { TestPicture } from './testing-content';

@Component({
  selector: 'app-test-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RuleFigure],
  host: { class: 'rule-picture test-picture' },
  templateUrl: './test-picture.html',
})
export class TestPictureView {
  readonly name = input.required<TestPicture>();
  readonly label = input('');

  readonly scaleTicks = [30, 45, 60, 75, 90, 105, 120];
  readonly runners = [52, 84, 116];
  readonly relayRunners = [
    { x: 60, y: 126, girl: true },
    { x: 120, y: 126, girl: false },
    { x: 180, y: 126, girl: true },
    { x: 214, y: 84, girl: false },
    { x: 180, y: 44, girl: true },
    { x: 120, y: 44, girl: false },
    { x: 60, y: 44, girl: true },
    { x: 26, y: 84, girl: false },
  ];
}
