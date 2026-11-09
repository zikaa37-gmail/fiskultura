import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-join-cta',
  imports: [RouterLink, MatButtonModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!auth.isAuthenticated()) {
      <aside class="join-cta accent-lime">
        <span class="tint-icon"><app-icon name="people" [size]="20" /></span>
        <div class="join-cta-text">
          <strong>{{ title() }}</strong>
          <span class="small">{{ text() }}</span>
        </div>
        <a mat-flat-button routerLink="/registracija">Napravi nalog</a>
      </aside>
    }
  `,
})
export class JoinCta {
  protected readonly auth = inject(AuthService);
  readonly title = input('Pridruži se kolegama');
  readonly text = input('Besplatno: propisi, pitanja i odgovori, pravila sportova, obaveštenja mejlom i imenik struke.');
}
