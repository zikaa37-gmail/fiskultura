import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { ROLE_LABELS } from '../../core/auth/user.model';
import { API_URL } from '../../core/http/api';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { debouncedSearch } from '../../shared/list-filters/search-input';
import { AdminUser, Page } from './admin.model';

export interface UserPickerData {
  title: string;
  intro: string;
  confirmLabel: string;
  exclude?: number[];
}

@Component({
  selector: 'app-user-picker-dialog',
  imports: [FormsModule, MatDialogModule, MatInputModule, MatProgressBarModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="data.title">
      <p class="muted mb-3">{{ data.intro }}</p>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Ime, mejl ili škola</mat-label>
        <input matInput type="search" enterkeyhint="search" [ngModel]="text()" (ngModelChange)="text.set($event); searchInput.schedule($event)" />
      </mat-form-field>
      @if (users.isLoading()) {
        <mat-progress-bar mode="indeterminate" />
      }
      <div class="moderator-options mb-2" role="listbox" aria-label="Korisnici">
        @for (user of results(); track user.id) {
          <button type="button" role="option" class="moderator-option" [class.moderator-option-selected]="selected()?.id === user.id" [attr.aria-selected]="selected()?.id === user.id" (click)="selected.set(user)">
            <strong>{{ user.name }}</strong>
            <span class="small muted">{{ roleLabels[user.role] }} · {{ user.email }}</span>
          </button>
        } @empty {
          @if (!users.isLoading()) {
            <p class="small muted">Nema korisnika za ovu pretragu.</p>
          }
        }
      </div>
      <ng-container dialogActions>
        <button type="button" mat-stroked-button mat-dialog-close>Odustani</button>
        <button type="button" mat-flat-button [disabled]="!selected()" (click)="ref.close(selected()!.id)">{{ data.confirmLabel }}</button>
      </ng-container>
    </app-dialog-shell>
  `,
  styles: `
    mat-form-field {
      width: 100%;
    }
    .moderator-options {
      display: grid;
      gap: 6px;
      margin-top: 12px;
    }
    .moderator-option {
      display: grid;
      gap: 2px;
      min-height: 44px;
      padding: 8px 12px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-surface);
      color: var(--color-text);
      font: inherit;
      text-align: left;
      cursor: pointer;
      overflow-wrap: anywhere;
    }
    .moderator-option-selected {
      border-color: var(--color-primary);
      box-shadow: inset 0 0 0 1px var(--color-primary);
    }
  `,
})
export class UserPickerDialog {
  protected readonly ref = inject(MatDialogRef<UserPickerDialog, number>);
  protected readonly data = inject<UserPickerData>(MAT_DIALOG_DATA);
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly text = signal('');
  readonly #search = signal('');
  protected readonly searchInput = debouncedSearch((value) => this.#search.set(value));
  protected readonly selected = signal<AdminUser | null>(null);

  protected readonly users = httpResource<Page<AdminUser>>(() => ({
    url: `${API_URL}/admin/users/list`,
    method: 'POST',
    body: { search: this.#search() || null, page: 1 },
  }));
  protected readonly results = computed(() => (this.users.hasValue() ? this.users.value().data.filter((user) => !user.blocked && !(this.data.exclude ?? []).includes(user.id)) : []));
}
