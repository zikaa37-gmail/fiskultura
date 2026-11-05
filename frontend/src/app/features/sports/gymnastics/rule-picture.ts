import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RuleFigure } from '../basketball/rule-figure';
import { GymnasticsRulePose } from './rule-pose';
import { GymnasticsPicture } from './rules-content';

@Component({
  selector: 'app-gymnastics-rule-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RuleFigure, GymnasticsRulePose],
  host: { class: 'rule-picture' },
  templateUrl: './rule-picture.html',
})
export class GymnasticsRulePicture {
  readonly name = input.required<GymnasticsPicture>();
  readonly label = input('');
}
