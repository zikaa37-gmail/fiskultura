import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/auth/auth.service';
import { ROLE_LABELS, UserRole } from '../../core/auth/user.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { formatDate } from '../../core/content/content.model';
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';
import { AdminUser, Page } from './admin.model';

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-toolbar">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Uloga</mat-label>
        <mat-select [value]="role()" (selectionChange)="role.set($event.value); page.set(1)">
          <mat-option value="">Sve</mat-option>
          @for (option of roles; track option) {
            <mat-option [value]="option">{{ roleLabels[option] }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <form class="search-form" (ngSubmit)="search.set(searchText().trim()); page.set(1)">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Pretraga (ime, mejl, škola, opština)</mat-label>
          <input matInput name="search" [ngModel]="searchText()" (ngModelChange)="searchText.set($event)" />
        </mat-form-field>
      </form>
    </div>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    @if (meta(); as info) {
      <p class="muted small result-count">Ukupno: {{ info.total }}</p>
    }
    <div class="admin-rows">
      @for (user of items(); track user.id) {
        @let isSelf = user.id === auth.currentUser()?.id;
        <div class="admin-row">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              @if (user.blocked) {
                <span class="state-chip state-warn">Blokiran</span>
              } @else if (!user.verified) {
                <span class="state-chip state-muted">Nepotvrđen mejl</span>
              }
              <span>od {{ date(user.created_at) }}</span>
              @if (user.municipality || user.district) {
                <span>· {{ user.municipality }}{{ user.municipality && user.district ? ', ' : '' }}{{ user.district }}</span>
              }
            </span>
            <strong>{{ user.name }}</strong>
            <span class="muted small">{{ user.email }}@if (user.school) { · {{ user.school }} }</span>
          </div>
          <div class="admin-row-actions">
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="role-select">
              <mat-select [value]="user.role" [disabled]="isSelf" (selectionChange)="changeRole(user, $event.value)" [attr.aria-label]="'Uloga za ' + user.name">
                @for (option of roles; track option) {
                  <mat-option [value]="option">{{ roleLabels[option] }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            @if (!isSelf) {
              <button type="button" mat-button [class.danger-text]="!user.blocked" (click)="toggleBlock(user)">{{ user.blocked ? 'Odblokiraj' : 'Blokiraj' }}</button>
            }
          </div>
        </div>
      }
    </div>
    @if (meta(); as info) {
      @if (info.last_page > 1) {
        <nav class="pager" aria-label="Stranice">
          <button type="button" mat-stroked-button [disabled]="info.page <= 1" (click)="page.set(info.page - 1)">← Prethodna</button>
          <span class="muted">Strana {{ info.page }} od {{ info.last_page }}</span>
          <button type="button" mat-stroked-button [disabled]="info.page >= info.last_page" (click)="page.set(info.page + 1)">Sledeća →</button>
        </nav>
      }
    }
  `,
})
export class AdminUsers {
  protected readonly auth = inject(AuthService);
  readonly #http = inject(HttpClient);
  readonly #notifications = inject(NotificationService);
  readonly #confirm = inject(ConfirmService);

  protected readonly roleLabels = ROLE_LABELS;
  protected readonly roles = Object.keys(ROLE_LABELS) as UserRole[];
  protected readonly role = signal<UserRole | ''>('');
  protected readonly search = signal('');
  protected readonly searchText = linkedSignal(() => this.search());
  protected readonly page = signal(1);

  protected readonly resource = httpResource<Page<AdminUser>>(() => ({
    url: `${API_URL}/admin/users/list`,
    method: 'POST',
    body: { role: this.role() || null, search: this.search() || null, page: this.page() },
  }));
  readonly #lastPage = linkedSignal<Page<AdminUser> | undefined, Page<AdminUser> | null>({
    source: () => (this.resource.hasValue() ? this.resource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });
  protected readonly items = computed(() => this.#lastPage()?.data ?? []);
  protected readonly meta = computed(() => this.#lastPage()?.meta ?? null);

  protected date(value: string | null): string {
    return formatDate(value);
  }

  protected changeRole(user: AdminUser, role: UserRole): void {
    this.#update(user, { role }, `${user.name} je sada: ${this.roleLabels[role]}.`);
  }

  protected toggleBlock(user: AdminUser): void {
    if (user.blocked) {
      this.#update(user, { blocked: false }, `${user.name} je odblokiran.`);
      return;
    }
    this.#confirm
      .confirm({ title: 'Blokiranje korisnika', message: `Blokirati ${user.name} (${user.email})? Odmah će biti odjavljen i neće moći da se prijavi.`, confirmLabel: 'Blokiraj' })
      .subscribe((confirmed) => confirmed && this.#update(user, { blocked: true }, `${user.name} je blokiran.`));
  }

  #update(user: AdminUser, changes: Partial<Pick<AdminUser, 'role' | 'blocked'>>, message: string): void {
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
