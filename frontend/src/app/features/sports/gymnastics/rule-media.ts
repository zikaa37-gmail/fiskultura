import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GymnasticsRulePicture } from './rule-picture';
import { RuleFocus, GymnasticsPicture } from './rules-content';

@Component({
  selector: 'app-gymnastics-rule-media',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GymnasticsRulePicture],
  host: { class: 'rule-media' },
  template: `
    @if (image(); as src) {
      <span class="rule-photo" [class.rule-photo-signal]="isSignal()">
        <img [src]="src" [alt]="label()" loading="lazy" />
        @if (focus(); as spot) {
          <span class="rule-focus" [style.left.%]="spot[0]" [style.top.%]="spot[1]" [style.width.%]="spot[2] * 2" aria-hidden="true"></span>
        }
      </span>
    } @else {
      @if (picture(); as name) {
        <app-gymnastics-rule-picture [name]="name" [label]="label()" />
      }
    }
  `,
})
export class GymnasticsRuleMedia {
  readonly picture = input<GymnasticsPicture | undefined>(undefined);
  readonly image = input<string | undefined>(undefined);
  readonly focus = input<RuleFocus | undefined>(undefined);
  readonly interactive = input(false);
  readonly label = input('');

  readonly isSignal = computed(() => this.image()?.includes('/signals/') ?? false);
}
