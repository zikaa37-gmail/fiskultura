import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { AuthService } from '../../core/auth/auth.service';
import { SeoService } from '../../core/seo/seo.service';
import { GateSection, MEMBERS_GATE } from '../../content/members-gate';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-members-only',
  imports: [RouterLink, RouterOutlet, BUTTON_IMPORTS, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { ngSkipHydration: 'true' },
  template: `
    @if (auth.isAuthenticated()) {
      <router-outlet />
    } @else {
      <section class="section">
        <div class="container">
          <div class="members-gate">
            <p class="eyebrow">Za članove · besplatno</p>
            <h1 class="mb-3">{{ gate.title }}</h1>
            <p class="lead mb-4">{{ gate.intro }}</p>
            <ul class="gate-topics mb-5">
              @for (topic of gate.topics; track topic) {
                <li><app-icon name="check" [size]="16" /> {{ topic }}</li>
              }
            </ul>
            <div class="gate-card">
              <span class="tint-icon"><app-icon name="people" [size]="20" /></span>
              <div>
                <strong>Ovaj deo je za nastavnike koji imaju nalog</strong>
                <p class="small muted">Nalog je besplatan i pravi se za minut. Vesti i udruženja ostaju javni za sve.</p>
              </div>
              <div class="profile-links">
                <a mat-flat-button routerLink="/registracija">Napravi nalog</a>
                <a mat-stroked-button routerLink="/prijava" [queryParams]="{ povratak: url }">Prijavi se</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    }
  `,
})
export class MembersOnly {
  protected readonly auth = inject(AuthService);
  readonly #route = inject(ActivatedRoute);
  readonly #seo = inject(SeoService);

  protected readonly gate = MEMBERS_GATE[this.#route.snapshot.data['gate'] as GateSection];
  protected readonly url = '/' + this.#route.snapshot.pathFromRoot.flatMap((route) => route.url.map((segment) => segment.path)).join('/');

  constructor() {
    if (!this.auth.isAuthenticated() && this.#route.snapshot.data['dynamicSeo']) {
      this.#seo.set({ title: this.gate.title, description: this.gate.intro, path: this.gate.path });
    }
  }
}
