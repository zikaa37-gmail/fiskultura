import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/auth/auth.service';
import { ROLE_LABELS, UserRole } from '../../core/auth/user.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { formatDate } from '../../core/content/content.model';
import { phoneHref } from '../../core/phone';
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';
import { debouncedSearch, searchDraft } from '../../shared/list-filters/search-input';
import { DeleteService } from '../../core/delete.service';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { ListHeader } from '../../shared/list-header/list-header';
import { AdminUser, Page } from './admin.model';
import { RoleDialog } from './role-dialog';
import { Icon } from '../../shared/icon/icon';
import { UserFormDialog } from './user-form-dialog';
import { Pagination } from '../../shared/pagination/pagination';

type UserAction = 'invite' | 'edit' | 'block' | 'unblock' | 'remove';

@Component({
  selector: 'app-admin-users',
  imports: [Pagination, FormsModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatProgressBarModule, MatSelectModule, OptionsMenu, Icon, FilterPanel, ListHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-filter-panel [summary]="filterSummary()">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Uloga</mat-label>
        <mat-select [value]="role()" (selectionChange)="role.set($event.value); page.set(1)">
          <mat-option value="">Sve</mat-option>
          @for (option of roles; track option) {
            <mat-option [value]="option">{{ roleLabels[option] }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Nalog</mat-label>
        <mat-select [value]="pending()" (selectionChange)="pending.set($event.value); page.set(1)">
          <mat-option [value]="false">Svi</mat-option>
          <mat-option [value]="true">Čekaju aktivaciju</mat-option>
        </mat-select>
      </mat-form-field>
      <form class="search-form" (ngSubmit)="searchInput.flush(searchText())">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Pretraga (ime, mejl, škola, opština)</mat-label>
          <input matInput name="search" type="search" enterkeyhint="search" [ngModel]="searchText()" (ngModelChange)="searchText.set($event); searchInput.schedule($event)" />
        </mat-form-field>
      </form>
    </app-filter-panel>
    <app-list-header [count]="meta()?.total ?? null">
      @if (invitable().length) {
        <button type="button" mat-flat-button theme="tertiary" [disabled]="sending()" [attr.aria-label]="'Pošalji poziv svima koji čekaju aktivaciju (' + invitable().length + ')'" (click)="inviteAll()">Pozovi sve ({{ invitable().length }})</button>
      }
      <button type="button" mat-flat-button (click)="openForm(null)">Dodaj korisnika</button>
    </app-list-header>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <div class="admin-rows">
      @for (user of items(); track user.id) {
        @let isSelf = user.id === auth.currentUser()?.id;
        <div class="admin-row admin-row-compact">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              @if (user.blocked) {
                <span class="state-chip state-warn">Blokiran</span>
              } @else if (!user.verified) {
                <span class="state-chip state-muted">Čeka aktivaciju</span>
              }
              @if (user.invited_at && !user.verified) {
                <span>poziv poslat {{ date(user.invited_at) }} ·</span>
              }
              <span>od {{ date(user.created_at) }}</span>
              @if (isSelf) {
                <span class="state-chip">{{ roleLabels[user.role] }}</span>
              } @else {
                <button type="button" class="state-chip role-chip" [attr.aria-label]="'Uloga: ' + roleLabels[user.role] + ' (promeni)'" (click)="openRole(user)">
                  {{ roleLabels[user.role] }}
                  <app-icon name="chevron-down" [size]="14" />
                </button>
              }
              @if (user.municipality || user.district) {
                <span>· {{ user.municipality }}{{ user.municipality && user.district ? ', ' : '' }}{{ user.district }}</span>
              }
            </span>
            <strong>{{ user.name }}</strong>
            <span class="muted small">{{ user.email }}@if (user.phone; as phone) { · <a class="nowrap" [href]="phoneHref(phone)">{{ phone }}</a> }@if (user.school) { · {{ user.school }} }</span>
          </div>
          @if (!isSelf) {
            <app-options-menu [options]="menuFor(user)" [label]="'Opcije za: ' + user.name" (selected)="onAction(user, $event)" />
          }
        </div>
      }
    </div>
    @if (meta(); as info) {
      <app-pagination [(page)]="page" [lastPage]="info.last_page" />
    }
  `,
})
export class AdminUsers {
  protected readonly auth = inject(AuthService);
  readonly #http = inject(HttpClient);
  readonly #notifications = inject(NotificationService);
  readonly #confirm = inject(ConfirmService);
  readonly #delete = inject(DeleteService);
  readonly #dialog = inject(MatDialog);

  protected readonly roleLabels = ROLE_LABELS;
  protected readonly roles = Object.keys(ROLE_LABELS) as UserRole[];
  protected readonly role = signal<UserRole | ''>('');
  protected readonly pending = signal(false);
  protected readonly sending = signal(false);
  protected readonly search = signal('');
  protected readonly searchText = searchDraft(() => this.search());
  protected readonly searchInput = debouncedSearch((value) => {
    if (value !== this.search()) {
      this.search.set(value);
      this.page.set(1);
    }
  });
  protected readonly page = signal(1);

  protected readonly resource = httpResource<Page<AdminUser>>(() => ({
    url: `${API_URL}/admin/users/list`,
    method: 'POST',
    body: { role: this.role() || null, pending: this.pending(), search: this.search() || null, page: this.page() },
  }));
  readonly #lastPage = linkedSignal<Page<AdminUser> | undefined, Page<AdminUser> | null>({
    source: () => (this.resource.hasValue() ? this.resource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });
  protected readonly items = computed(() => this.#lastPage()?.data ?? []);
  protected readonly meta = computed(() => this.#lastPage()?.meta ?? null);
  protected readonly invitable = computed(() => this.items().filter((user) => !user.verified && !user.blocked));

  protected readonly phoneHref = phoneHref;
  protected readonly filterSummary = computed(() => {
    const role = this.role();
    const parts = [role ? this.roleLabels[role] : '', this.pending() ? 'Čekaju aktivaciju' : '', this.search() ? `„${this.search()}”` : ''];
    return parts.filter(Boolean).join(' · ') || 'Svi korisnici';
  });

  protected date(value: string | null): string {
    return formatDate(value);
  }

  protected openRole(user: AdminUser): void {
    this.#dialog
      .open<RoleDialog, AdminUser, UserRole | null>(RoleDialog, { data: user, width: '520px', maxWidth: 'calc(100vw - 32px)', panelClass: 'app-dialog-panel' })
      .afterClosed()
      .subscribe((role) => {
        if (role) {
          this.#notifications.show(`${user.name} je sada: ${this.roleLabels[role]}.`);
          this.resource.reload();
        }
      });
  }

  protected menuFor(user: AdminUser): MenuOption<UserAction>[] {
    const options: MenuOption<UserAction>[] = [];
    if (!user.verified && !user.blocked) {
      options.push({ value: 'invite', label: user.invited_at ? 'Pošalji poziv ponovo' : 'Pošalji poziv', icon: 'mail', disabled: this.sending() });
    }
    options.push({ value: 'edit', label: 'Izmeni', icon: 'edit' });
    options.push(
      user.blocked
        ? { value: 'unblock', label: 'Odblokiraj', icon: 'check', dividerBefore: true }
        : { value: 'block', label: 'Blokiraj', icon: 'ban', danger: true, dividerBefore: true },
      { value: 'remove', label: 'Obriši', icon: 'trash', danger: true },
    );
    return options;
  }

  protected onAction(user: AdminUser, action: UserAction): void {
    switch (action) {
      case 'invite':
        this.#sendInvitations([user.id]);
        break;
      case 'edit':
        this.openForm(user);
        break;
      case 'block':
      case 'unblock':
        this.#toggleBlock(user);
        break;
      case 'remove':
        this.#remove(user);
        break;
    }
  }

  protected inviteAll(): void {
    const ids = this.invitable().map((user) => user.id);
    this.#confirm
      .confirm({ title: 'Slanje pozivnica', message: `Poslati lični poziv za ${ids.length} korisnika koji čekaju aktivaciju (na ovoj strani)? Svako dobija mejl sa svojim linkom, a raniji linkovi prestaju da važe.`, confirmLabel: 'Pošalji', theme: 'primary' })
      .subscribe((confirmed) => confirmed && this.#sendInvitations(ids));
  }

  #sendInvitations(ids: number[]): void {
    this.sending.set(true);
    this.#http.post<{ sent: number; failed: number; skipped: number }>(`${API_URL}/admin/users/invitations`, { ids }).subscribe({
      next: ({ sent, failed, skipped }) => {
        this.sending.set(false);
        this.#notifications.show(`Poslato pozivnica: ${sent}${failed ? `, nije uspelo: ${failed}` : ''}${skipped ? `, preskočeno: ${skipped}` : ''}.`);
        this.resource.reload();
      },
      error: (error) => {
        this.sending.set(false);
        this.#notifications.show(apiErrorMessage(error));
      },
    });
  }

  protected openForm(user: AdminUser | null): void {
    this.#dialog
      .open<UserFormDialog, AdminUser | null, AdminUser>(UserFormDialog, { data: user, width: '520px', maxWidth: 'calc(100vw - 32px)', panelClass: 'app-dialog-panel' })
      .afterClosed()
      .subscribe((saved) => {
        if (!saved) {
          return;
        }
        this.resource.reload();
        if (user) {
          this.#notifications.show('Izmene su sačuvane.');
          return;
        }
        this.#confirm
          .confirm({
            title: 'Poslati poziv?',
            message: `${saved.name} je dodat. Da li želiš da mu sada pošalješ lični poziv na ${saved.email} da završi registraciju? Poziv možeš poslati i kasnije iz menija.`,
            confirmLabel: 'Pošalji poziv',
            cancelLabel: 'Ne sada',
            theme: 'primary',
          })
          .subscribe((send) => (send ? this.#sendInvitations([saved.id]) : this.#notifications.show(`${saved.name} je dodat, poziv nije poslat.`)));
      });
  }

  #remove(user: AdminUser): void {
    this.#delete.confirmDelete(
      {
        title: 'Brisanje korisnika',
        message: `Trajno obrisati ${user.name} (${user.email})? Briše se nalog i prijava na obaveštenja i to ne može da se vrati.`,
        url: `${API_URL}/admin/users/${user.id}`,
        success: `${user.name} je obrisan.`,
      },
      () => this.resource.reload(),
    );
  }

  #toggleBlock(user: AdminUser): void {
    if (user.blocked) {
      this.#update(user, { blocked: false }, `${user.name} je odblokiran.`);
      return;
    }
    this.#confirm
      .confirm({ title: 'Blokiranje korisnika', message: `Blokirati ${user.name} (${user.email})? Odmah će biti odjavljen i neće moći da se prijavi.`, confirmLabel: 'Blokiraj' })
      .subscribe((confirmed) => confirmed && this.#update(user, { blocked: true }, `${user.name} je blokiran.`));
  }

  #update(user: AdminUser, changes: Partial<Pick<AdminUser, 'blocked'>>, message: string): void {
    this.#http.patch<AdminUser>(`${API_URL}/admin/users/${user.id}`, changes).subscribe({
      next: () => {
        this.#notifications.show(message);
        this.resource.reload();
      },
      error: (error) => {
        this.#notifications.show(apiErrorMessage(error));
        this.resource.reload();
      },
    });
  }
}
