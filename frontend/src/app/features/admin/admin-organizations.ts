import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/auth/auth.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { ORGANIZATION_LEVEL_LABELS, ORGANIZATION_TYPE_LABELS } from '../../core/content/content.model';
import { ListHeader } from '../../shared/list-header/list-header';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';
import { AdminOrganization } from './admin.model';

type RowAction = 'view' | 'edit' | 'remove';

@Component({
  selector: 'app-admin-organizations',
  imports: [FormsModule, RouterLink, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatProgressBarModule, ListHeader, OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-toolbar">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Pretraga (naziv, grad)</mat-label>
        <input matInput [ngModel]="search()" (ngModelChange)="search.set($event)" />
      </mat-form-field>
    </div>
    <app-list-header [count]="filtered().length">
      <a mat-flat-button routerLink="nova">Nova organizacija</a>
    </app-list-header>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <div class="admin-rows">
      @for (item of filtered(); track item.id) {
        <div class="admin-row admin-row-compact">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              <span class="state-chip" [class]="item.status === 'aktivno' ? 'state-ok' : 'state-muted'">{{ item.status }}</span>
              <span>{{ typeLabels[item.type] }} · {{ levelLabels[item.level] }}</span>
              @if (item.city) {
                <span>· {{ item.city }}</span>
              }
              @if (item.parent; as parent) {
                <span>· članica {{ parent.short_name ?? parent.name }}</span>
              }
              <span>· vesti: {{ item.news_count ?? 0 }}</span>
            </span>
            <a class="post-title" [routerLink]="[item.id]">{{ item.name }}@if (item.short_name) { ({{ item.short_name }}) }</a>
            @if (!item.website && !item.email && !item.social.facebook) {
              <span class="small warn-text">Nema sajta, mejla ni Facebook-a</span>
            }
          </div>
          <app-options-menu [options]="menuFor(item)" [label]="'Opcije za: ' + item.name" (selected)="onAction(item, $event)" />
        </div>
      }
    </div>
  `,
})
export class AdminOrganizations {
  protected readonly auth = inject(AuthService);
  readonly #http = inject(HttpClient);
  readonly #notifications = inject(NotificationService);
  readonly #confirm = inject(ConfirmService);

  protected readonly typeLabels = ORGANIZATION_TYPE_LABELS;
  protected readonly levelLabels = ORGANIZATION_LEVEL_LABELS;
  protected readonly search = signal('');
  protected readonly resource = httpResource<AdminOrganization[]>(() => `${API_URL}/admin/organizations`);
  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const items = this.resource.hasValue() ? this.resource.value() : [];
    return term ? items.filter((item) => [item.name, item.short_name, item.city].some((value) => value?.toLowerCase().includes(term))) : items;
  });

  protected menuFor(item: AdminOrganization): MenuOption<RowAction>[] {
    const options: MenuOption<RowAction>[] = [
      { value: 'view', label: 'Pogledaj', icon: 'eye', link: ['/udruzenja', item.slug], newTab: true },
      { value: 'edit', label: 'Izmeni', icon: 'edit', link: ['/admin/udruzenja', item.id] },
    ];
    if (this.auth.isAdmin()) {
      options.push({ value: 'remove', label: 'Obriši', icon: 'trash', danger: true, dividerBefore: true });
    }
    return options;
  }

  protected onAction(item: AdminOrganization, action: RowAction): void {
    if (action === 'remove') {
      this.remove(item);
    }
  }

  protected remove(item: AdminOrganization): void {
    this.#confirm
      .confirm({
        title: 'Brisanje organizacije',
        message: `Obrisati „${item.name}“? Njene vesti ostaju, ali bez oznake organizacije${item.news_count ? ` (${item.news_count})` : ''}.`,
        confirmLabel: 'Obriši',
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.#http.delete<{ message: string }>(`${API_URL}/admin/organizations/${item.id}`).subscribe({
          next: (response) => {
            this.#notifications.show(response.message);
            this.resource.reload();
          },
          error: (error) => this.#notifications.show(apiErrorMessage(error)),
        });
      });
  }
}
