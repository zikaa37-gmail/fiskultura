import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RuleFigure } from '../basketball/rule-figure';
import { ElementaryGamesPicture } from './rules-content';

const CENTER_X = 120;
const CENTER_Y = 96;

@Component({
  selector: 'app-elementary-games-rule-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RuleFigure],
  host: { class: 'rule-picture' },
  templateUrl: './rule-picture.html',
})
export class ElementaryGamesRulePicture {
  readonly name = input.required<ElementaryGamesPicture>();
  readonly label = input('');

  readonly pairSpots = Array.from({ length: 6 }, (_, index) => {
    const angle = ((index * 60 + 30) * Math.PI) / 180;
    return {
      innerX: Math.round(CENTER_X + 58 * Math.cos(angle)),
      innerY: Math.round(CENTER_Y + 34 * Math.sin(angle)),
      outerX: Math.round(CENTER_X + 78 * Math.cos(angle)),
      outerY: Math.round(CENTER_Y + 46 * Math.sin(angle)),
    };
  });

  readonly ringSpots = Array.from({ length: 12 }, (_, index) => {
    const angle = (index * 30 * Math.PI) / 180;
    return { x: Math.round(CENTER_X + 80 * Math.cos(angle)), y: Math.round(CENTER_Y + 48 * Math.sin(angle)) };
  });
}
