import { ChangeDetectionStrategy, Component, computed, inject, Injector, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDivider } from '@angular/material/divider';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { AuthService } from '../core/auth/auth.service';
import { InboxService } from '../core/inbox/inbox.service';
import { User } from '../core/auth/user.model';
import { Icon } from '../shared/icon/icon';

@Component({
  selector: 'app-account-menu',
  imports: [RouterLink, MatDivider, MatMenu, MatMenuItem, MatMenuTrigger, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="account-button" [matMenuTriggerFor]="accountMenu" aria-label="Moj nalog" (click)="opened.emit()">
      <app-icon name="user" [size]="20" />
      <span class="account-name">{{ firstName() }}</span>
      <app-icon name="chevron-down" [size]="16" />
    </button>
    <mat-menu #accountMenu="matMenu" xPosition="before" class="account-menu">
      <div class="account-menu-head">
        <strong>{{ user().name }}</strong>
        <span class="small muted">{{ user().email }}</span>
      </div>
      <a mat-menu-item routerLink="/profil"><app-icon name="user" [size]="20" /> Moj profil</a>
      <a mat-menu-item routerLink="/notifikacije"><app-icon name="bell" [size]="20" /> Notifikacije{{ inbox.unread() ? ' (' + inbox.unread() + ')' : '' }}</a>
      <button type="button" mat-menu-item (click)="openNotifications()"><app-icon name="mail" [size]="20" /> Obaveštenja mejlom</button>
      <button type="button" mat-menu-item (click)="askQuestion()"><app-icon name="help" [size]="20" /> Postavi pitanje</button>
      <a mat-menu-item routerLink="/imenik"><app-icon name="people" [size]="20" /> Imenik struke</a>
      @if (auth.isStaff()) {
        <a mat-menu-item routerLink="/admin"><app-icon name="clipboard" [size]="20" /> Admin</a>
      }
      <mat-divider />
      <button type="button" mat-menu-item class="logout-item" (click)="auth.logout()"><app-icon name="logout" [size]="20" /> Odjavi se</button>
    </mat-menu>
  `,
})
export class AccountMenu {
  readonly user = input.required<User>();
  readonly opened = output();

  protected readonly auth = inject(AuthService);
  protected readonly inbox = inject(InboxService);
  readonly #injector = inject(Injector);

  protected readonly firstName = computed(() => (this.user().name ?? '').trim().split(/\s+/)[0] || 'Nalog');

  protected async openNotifications(): Promise<void> {
    const { NotificationsDialogService } = await import('../features/notifications/notifications-dialog');
    this.#injector.get(NotificationsDialogService).open();
  }

  protected async askQuestion(): Promise<void> {
    const { AskQuestionDialogService } = await import('../features/questions/ask-question-dialog');
    this.#injector.get(AskQuestionDialogService).open();
  }
}
