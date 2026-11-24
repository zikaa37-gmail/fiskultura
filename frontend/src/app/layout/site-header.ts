import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { Icon } from '../shared/icon/icon';
import { AccountMenu } from './account-menu';
import { AdminNavService } from './admin-nav.service';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, Icon, AccountMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-header.html',
})
export class SiteHeader {
  protected readonly auth = inject(AuthService);
  protected readonly adminNav = inject(AdminNavService);

  protected readonly menuOpen = signal(false);
  protected readonly firstName = computed(() => (this.auth.currentUser()?.name ?? '').trim().split(/\s+/)[0] || 'Nalog');
  protected readonly navItems = [
    { route: '/vesti', label: 'Vesti' },
    { route: '/udruzenja', label: 'Udruženja' },
    { route: '/propisi', label: 'Propisi' },
    { route: '/ishodi', label: 'Ishodi' },
    { route: '/pitanja', label: 'Pitanja' },
    { route: '/sportovi', label: 'Sportovi' },
    { route: '/aplikacije', label: 'Aplikacije' },
  ];

  protected toggleMenu(): void {
    this.adminNav.close();
    this.menuOpen.update((open) => !open);
  }

  protected toggleAdminMenu(): void {
    this.menuOpen.set(false);
    this.adminNav.toggle();
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
