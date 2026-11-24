import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { OptionsMenu } from '../options-menu/options-menu';
import { SocialShareData } from './social.model';
import { SocialShareService } from './social-share.service';

@Component({
  selector: 'app-share-menu',
  imports: [OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-options-menu [options]="options()" [label]="'Podeli: ' + data().title" (selected)="share.handle($event, data())" />`,
})
export class ShareMenu {
  readonly data = input.required<SocialShareData>();

  protected readonly share = inject(SocialShareService);
  protected readonly options = computed(() => this.share.options());
}
