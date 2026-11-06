import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/auth/auth.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { ORGANIZATION_LEVEL_LABELS, ORGANIZATION_TYPE_LABELS } from '../../core/content/content.model';
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';
import { AdminOrganization } from './admin.model';

@Component({
  selector: 'app-admin-organizations',
  imports: [FormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-toolbar">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Pretraga (naziv, grad)</mat-label>
        <input matInput [ngModel]="search()" (ngModelChange)="search.set($event)" />
      </mat-form-field>
      <a mat-flat-button routerLink="nova">Nova organizacija</a>
    </div>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <p class="muted small result-count mb-2">Ukupno: {{ filtered().length }}</p>
    <div class="admin-rows">
      @for (item of filtered(); track item.id) {
        <div class="admin-row">
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
          <div class="admin-row-actions">
            <a mat-button [routerLink]="['/udruzenja', item.slug]" target="_blank">Pogledaj</a>
            <a mat-stroked-button [routerLink]="[item.id]">Izmeni</a>
            @if (auth.isAdmin()) {
              <button type="button" mat-button class="danger-text" (click)="remove(item)">Obriši</button>
            }
          </div>
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
