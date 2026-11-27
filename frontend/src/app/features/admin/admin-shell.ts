import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MailboxStatusService } from '../../core/inbox/mailbox-status.service';
import { AdminNavService } from '../../layout/admin-nav.service';
import { Icon, IconName } from '../../shared/icon/icon';

interface AdminLink {
  route: string;
  label: string;
  icon: IconName;
  exact?: boolean;
  editorOnly?: boolean;
  mail?: boolean;
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
                      [routerLinkActiveOptions]="link.exact ? exactPath : subsetPath"
                      (click)="adminNav.close()"
                    >
                      <app-icon [name]="link.icon" [size]="20" />
                      <span>{{ link.label }}</span>
                      @if (link.mail && mailbox.unread()) {
                        <span class="admin-nav-count" [attr.aria-label]="'nepročitanih: ' + mailbox.unread()">{{ mailbox.unread() }}</span>
                      }
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
  protected readonly exactPath: IsActiveMatchOptions = { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' };
  protected readonly subsetPath: IsActiveMatchOptions = { paths: 'subset', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' };
  readonly #groups: AdminGroup[] = [
    {
      title: 'Vesti',
      links: [
        { route: 'vesti', label: 'Vesti', icon: 'news', editorOnly: true },
        { route: 'predlozi', label: 'Predlozi vesti', icon: 'checklist', editorOnly: true },
        { route: 'izvori', label: 'Izvori organizacija', icon: 'link', editorOnly: true },
      ],
    },
    {
      title: 'Sadržaj portala',
      links: [
        { route: 'pitanja', label: 'Pitanja', icon: 'help' },
        { route: 'debate', label: 'Stručne debate', icon: 'people', editorOnly: true },
        { route: 'tekstovi', label: 'Priče kolega', icon: 'edit' },
        { route: 'udruzenja', label: 'Udruženja', icon: 'globe', editorOnly: true },
        { route: 'propisi', label: 'Propisi', icon: 'book', editorOnly: true },
        { route: 'drustvene-mreze', label: 'Društvene mreže', icon: 'instagram', editorOnly: true },
        { route: 'infrastruktura', label: 'Infrastruktura škola', icon: 'checklist', editorOnly: true },
      ],
    },
    {
      title: 'Korisnici',
      adminOnly: true,
      links: [
        { route: 'korisnici', label: 'Korisnici', icon: 'user' },
        { route: 'moderatori', label: 'Moderatori', icon: 'people' },
        { route: 'posta', label: 'Pošta (admin@)', icon: 'mail', mail: true },
        { route: 'clanstvo', label: 'Članstvo', icon: 'people' },
        { route: 'obavestenja', label: 'Obaveštenja', icon: 'mail' },
      ],
    },
  ];

  protected readonly mailbox = inject(MailboxStatusService);

  constructor() {
    this.adminNav.available.set(true);
    inject(DestroyRef).onDestroy(() => {
      this.adminNav.available.set(false);
      this.adminNav.close();
    });
  }

  protected readonly visibleGroups = computed(() =>
    this.#groups
      .filter((group) => !group.adminOnly || this.#auth.isAdmin())
      .map((group) => ({ ...group, links: group.links.filter((link) => !link.editorOnly || this.#auth.isEditor()) }))
      .filter((group) => group.links.length),
  );
}
