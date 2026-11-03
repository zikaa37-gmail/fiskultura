import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Icon } from '../shared/icon/icon';
import { APP_LINKS } from '../content/portal-content';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-header.html',
})
export class SiteHeader {
  protected readonly ePripremeUrl = APP_LINKS.ePripreme;
  protected readonly menuOpen = signal(false);
  protected readonly navItems = [
    { route: '/vesti', label: 'nav.news' },
    { route: '/udruzenja', label: 'nav.organizations' },
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
