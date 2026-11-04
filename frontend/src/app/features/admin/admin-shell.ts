import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatTabsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section admin">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Uređivanje</p>
          <h1>Admin</h1>
        </div>
        <nav mat-tab-nav-bar [tabPanel]="panel" class="admin-tabs">
          @for (tab of tabs; track tab.route) {
            @if (!tab.adminOnly || auth.isAdmin()) {
              <a mat-tab-link [routerLink]="tab.route" routerLinkActive #active="routerLinkActive" [active]="active.isActive">{{ tab.label }}</a>
            }
          }
        </nav>
        <mat-tab-nav-panel #panel>
          <router-outlet />
        </mat-tab-nav-panel>
      </div>
    </section>
  `,
})
export class AdminShell {
  protected readonly auth = inject(AuthService);
  protected readonly tabs = [
    { route: 'vesti', label: 'Vesti', adminOnly: false },
    { route: 'udruzenja', label: 'Udruženja', adminOnly: false },
    { route: 'propisi', label: 'Propisi', adminOnly: false },
    { route: 'korisnici', label: 'Korisnici', adminOnly: true },
  ];
}
