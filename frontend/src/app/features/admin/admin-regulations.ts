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
import { Regulation, REGULATION_KIND_LABELS, VERIFICATION_LABELS } from '../../core/content/regulation.model';
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-regulations',
  imports: [FormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-toolbar">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="admin-search">
        <mat-label>Pretraga (naziv, glasnik)</mat-label>
        <input matInput [ngModel]="search()" (ngModelChange)="search.set($event)" />
      </mat-form-field>
      <a mat-flat-button routerLink="novi">Novi propis</a>
    </div>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <p class="muted small result-count">Ukupno: {{ filtered().length }}</p>
    <div class="admin-rows">
      @for (item of filtered(); track item.id) {
        <div class="admin-row">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              <span class="state-chip state-muted">{{ kindLabels[item.kind] }}</span>
              <span class="state-chip" [class]="item.verification === 'unverified' ? 'state-warn' : 'state-ok'">{{ verificationLabels[item.verification] }}</span>
              <span>verzija {{ item.version }}</span>
            </span>
            <a class="post-title" [routerLink]="[item.key]">{{ item.title }}</a>
          </div>
          <div class="admin-row-actions">
            <a mat-stroked-button [routerLink]="[item.key]">Izmeni</a>
            @if (auth.isAdmin()) {
              <button type="button" mat-button class="danger-text" (click)="remove(item)">Obriši</button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminRegulations {
  protected readonly auth = inject(AuthService);
  readonly #http = inject(HttpClient);
  readonly #notifications = inject(NotificationService);
  readonly #confirm = inject(ConfirmService);

  protected readonly kindLabels = REGULATION_KIND_LABELS;
  protected readonly verificationLabels = VERIFICATION_LABELS;
  protected readonly search = signal('');
  protected readonly resource = httpResource<Regulation[]>(() => `${API_URL}/regulations`);
  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const items = this.resource.hasValue() ? this.resource.value() : [];
    return term ? items.filter((item) => [item.title, item.gazette, item.key].some((value) => value?.toLowerCase().includes(term))) : items;
  });

  protected remove(item: Regulation): void {
    this.#confirm.confirm({ title: 'Brisanje propisa', message: `Obrisati „${item.title}“ sa istorijom izmena?`, confirmLabel: 'Obriši' }).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.#http.delete(`${API_URL}/admin/regulations/${item.id}`).subscribe({
        next: () => {
          this.#notifications.show('Propis je obrisan.');
          this.resource.reload();
        },
        error: (error) => this.#notifications.show(apiErrorMessage(error)),
      });
    });
  }
}
