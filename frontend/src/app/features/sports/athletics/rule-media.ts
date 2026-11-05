import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AthleticsRulePicture } from './rule-picture';
import { RuleFocus, AthleticsPicture } from './rules-content';

@Component({
  selector: 'app-athletics-rule-media',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AthleticsRulePicture],
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
        <app-athletics-rule-picture [name]="name" [label]="label()" />
      }
    }
  `,
})
export class AthleticsRuleMedia {
  readonly picture = input<AthleticsPicture | undefined>(undefined);
  readonly image = input<string | undefined>(undefined);
  readonly focus = input<RuleFocus | undefined>(undefined);
  readonly interactive = input(false);
  readonly label = input('');

  readonly isSignal = computed(() => this.image()?.includes('/signals/') ?? false);
}
