import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RuleFigure } from '../basketball/rule-figure';
import { PropsPicture } from './rules-content';

@Component({
  selector: 'app-props-rule-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RuleFigure],
  host: { class: 'rule-picture' },
  templateUrl: './rule-picture.html',
})
export class PropsRulePicture {
  readonly name = input.required<PropsPicture>();
  readonly label = input('');
}
