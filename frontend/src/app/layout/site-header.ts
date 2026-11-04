import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Icon } from '../shared/icon/icon';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-header.html',
})
export class SiteHeader {
  protected readonly auth = inject(AuthService);
  protected readonly menuOpen = signal(false);
  protected readonly navItems = [
    { route: '/vesti', label: 'nav.news' },
    { route: '/udruzenja', label: 'nav.organizations' },
    { route: '/propisi', label: 'nav.regulations' },
    { route: '/sportovi', label: 'nav.sports' },
    { route: '/aplikacije', label: 'nav.apps' },
  ];

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
