import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-subscribe-link',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="subscribe-link" [class.subscribe-link-footer]="footer()" routerLink="/obavestenja">
      <span class="subscribe-link-icon" aria-hidden="true"><app-icon name="mail" [size]="18" /></span>
      <span>{{ label() }}</span>
    </a>
  `,
})
export class SubscribeLink {
  readonly label = input('Primajte vesti mejlom');
  readonly footer = input(false);
}
