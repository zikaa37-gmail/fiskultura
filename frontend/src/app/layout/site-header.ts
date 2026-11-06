import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../shared/icon/icon';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-header.html',
})
export class SiteHeader {
  protected readonly auth = inject(AuthService);
  protected readonly menuOpen = signal(false);
  protected readonly navItems = [
    { route: '/vesti', label: 'Vesti' },
    { route: '/udruzenja', label: 'Udruženja' },
    { route: '/propisi', label: 'Propisi' },
    { route: '/ishodi', label: 'Ishodi' },
    { route: '/pitanja', label: 'Pitanja' },
    { route: '/sportovi', label: 'Sportovi i pravila' },
    { route: '/aplikacije', label: 'Aplikacije' },
  ];

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
