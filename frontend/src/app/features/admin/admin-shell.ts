import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AdminNavService } from '../../layout/admin-nav.service';
import { Icon, IconName } from '../../shared/icon/icon';

interface AdminLink {
  route: string;
  label: string;
  icon: IconName;
  exact?: boolean;
}

interface AdminGroup {
  title: string;
  adminOnly?: boolean;
  links: AdminLink[];
}

@Component({
  selector: 'app-admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'adminNav.close()' },
  template: `
    <section class="section admin admin-section">
      <h1 class="visually-hidden">Admin</h1>
      <div class="container">
        <div class="admin-layout">
          @if (adminNav.open()) {
            <button type="button" class="admin-nav-backdrop" aria-label="Zatvori admin meni" (click)="adminNav.close()"></button>
          }
          <nav class="admin-nav" [class.admin-nav-open]="adminNav.open()" aria-label="Admin meni">
            @for (group of visibleGroups(); track group.title) {
              <div class="admin-nav-group">
                <p class="admin-nav-title">{{ group.title }}</p>
                <div class="admin-nav-links">
                  @for (link of group.links; track link.route) {
                    <a
                      class="admin-nav-link"
                      [routerLink]="link.route"
                      routerLinkActive="admin-nav-active"
                      ariaCurrentWhenActive="page"
                      [routerLinkActiveOptions]="{ exact: !!link.exact }"
                      (click)="adminNav.close()"
                    >
                      <app-icon [name]="link.icon" [size]="20" />
                      <span>{{ link.label }}</span>
                    </a>
                  }
                </div>
              </div>
            }
          </nav>
          <div class="admin-content">
            <router-outlet />
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AdminShell {
  readonly #auth = inject(AuthService);
  protected readonly adminNav = inject(AdminNavService);
  readonly #groups: AdminGroup[] = [
    {
      title: 'Vesti',
      links: [
        { route: 'vesti', label: 'Sve vesti', icon: 'news', exact: true },
        { route: 'vesti/nova', label: 'Nova vest', icon: 'star', exact: true },
      ],
    },
    {
      title: 'Sadržaj portala',
      links: [
        { route: 'pitanja', label: 'Pitanja', icon: 'help' },
        { route: 'udruzenja', label: 'Udruženja', icon: 'globe' },
        { route: 'propisi', label: 'Propisi', icon: 'book' },
      ],
    },
    {
      title: 'Korisnici',
      adminOnly: true,
      links: [
        { route: 'korisnici', label: 'Korisnici', icon: 'user' },
        { route: 'clanstvo', label: 'Članstvo', icon: 'people' },
        { route: 'obavestenja', label: 'Obaveštenja', icon: 'mail' },
      ],
    },
  ];

  constructor() {
    this.adminNav.available.set(true);
    inject(DestroyRef).onDestroy(() => {
      this.adminNav.available.set(false);
      this.adminNav.close();
    });
  }

  protected readonly visibleGroups = computed(() => this.#groups.filter((group) => !group.adminOnly || this.#auth.isAdmin()));
}
