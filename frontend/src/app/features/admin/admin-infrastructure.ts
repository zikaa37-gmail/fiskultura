import { ChangeDetectionStrategy, Component, Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { formatDate } from '../../core/content/content.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { queryFilters } from '../../shared/list-filters/query-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { Page } from './admin.model';

type SubmissionStatus = 'pending' | 'approved' | 'rejected';

interface GroupView {
  label: string;
  items: { label: string; value: string }[];
}

interface Submission {
  id: number;
  status: SubmissionStatus;
  proposed: GroupView[];
  current: GroupView[];
  note: string | null;
  institution: { id: number; name: string; place: string | null; type: string } | null;
  user: { id: number; name: string; school: string | null; email: string } | null;
  review_note: string | null;
  reviewer: string | null;
  reviewed_at: string | null;
  created_at: string | null;
}

const STATUS_LABELS: Record<SubmissionStatus, string> = { pending: 'Čeka proveru', approved: 'Odobreno', rejected: 'Odbijeno' };

@Component({
  selector: 'app-reject-submission-dialog',
  imports: [MatDialogModule, MatInputModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell title="Odbij predlog">
      <p class="small muted mb-3">Kolega dobija mejl i notifikaciju sa razlogom.</p>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="reject-field">
        <mat-label>Razlog</mat-label>
        <textarea matInput rows="3" maxlength="500" [value]="reason()" (input)="reason.set($any($event.target).value)"></textarea>
      </mat-form-field>
      <ng-container dialogActions>
        <button type="button" mat-stroked-button mat-dialog-close>Odustani</button>
        <button type="button" mat-flat-button theme="danger" [disabled]="reason().trim().length < 5" (click)="ref.close(reason().trim())">Odbij</button>
      </ng-container>
    </app-dialog-shell>
  `,
  styles: `
    .reject-field {
      width: 100%;
    }
  `,
})
export class RejectSubmissionDialog {
  protected readonly ref = inject(MatDialogRef<RejectSubmissionDialog, string>);
  protected readonly data = inject(MAT_DIALOG_DATA);
  protected readonly reason = signal('');
}

@Injectable({ providedIn: 'root' })
export class RejectSubmissionDialogService {
  readonly #dialog = inject(MatDialog);

  open() {
    return this.#dialog.open<RejectSubmissionDialog, null, string>(RejectSubmissionDialog, { data: null, width: '480px', maxWidth: '100vw', panelClass: 'app-dialog-panel', autoFocus: false }).afterClosed();
  }
}

@Component({
  selector: 'app-admin-infrastructure',
  imports: [MatProgressBarModule, ListFilters, ListHeader, OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-list-filters [fields]="fields" [values]="filters.values()" emptySummary="Čeka proveru" (filterChange)="filters.set($event)" (clearAll)="filters.clear()" />
    <app-list-header [count]="resource.value()?.meta?.total ?? null" label="Predloga" />
    @if (resource.isLoading() || busy()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <div class="admin-rows">
      @for (item of items(); track item.id) {
        <div class="admin-row">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              <span class="state-chip" [class]="item.status === 'pending' ? 'state-warn' : item.status === 'approved' ? 'state-ok' : 'state-muted'">{{ statusLabels[item.status] }}</span>
              <span>{{ item.user?.name }}{{ item.user?.school ? ' · ' + item.user?.school : '' }}</span>
              <span>{{ date(item.created_at) }}</span>
            </span>
            <strong class="post-title">{{ item.institution?.name }}{{ item.institution?.place ? ', ' + item.institution?.place : '' }}</strong>
            <div class="submission-compare">
              <div>
                <p class="small muted">Predlog</p>
                @for (group of item.proposed; track group.label) {
                  <p class="small"><strong>{{ group.label }}:</strong> {{ joined(group) }}</p>
                }
                @if (item.note) {
                  <p class="small"><strong>Napomena:</strong> {{ item.note }}</p>
                }
              </div>
              <div>
                <p class="small muted">Sada u Imeniku</p>
                @for (group of item.current; track group.label) {
                  <p class="small"><strong>{{ group.label }}:</strong> {{ joined(group) }}</p>
                } @empty {
                  <p class="small muted">Nema podataka.</p>
                }
              </div>
            </div>
            @if (item.review_note) {
              <span class="small muted">{{ item.reviewer }}: {{ item.review_note }}</span>
            }
          </div>
          @if (item.status === 'pending') {
            <app-options-menu [options]="menu" [label]="'Opcije za predlog: ' + item.institution?.name" (selected)="act(item, $event)" />
          }
        </div>
      } @empty {
        @if (!resource.isLoading()) {
          <p class="muted">Nema predloga za ovaj izbor.</p>
        }
      }
    </div>
  `,
  styles: `
    .submission-compare {
      display: grid;
      gap: 8px;
      margin-top: 8px;
    }
    .submission-compare p {
      margin: 0 0 4px;
      white-space: pre-line;
    }
    @media (min-width: 720px) {
      .submission-compare {
        grid-template-columns: 1fr 1fr;
      }
    }
  `,
})
export class AdminInfrastructure {
  readonly #http = inject(HttpClient);
  readonly #notifications = inject(NotificationService);
  readonly #reject = inject(RejectSubmissionDialogService);

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly filters = queryFilters(['status']);
  protected readonly fields: FilterField[] = [
    { key: 'status', label: 'Status', allLabel: 'Čeka proveru', options: [{ value: 'approved', label: 'Odobreno' }, { value: 'rejected', label: 'Odbijeno' }] },
  ];
  protected readonly menu: MenuOption<'approve' | 'reject'>[] = [
    { value: 'approve', label: 'Odobri i objavi', icon: 'check' },
    { value: 'reject', label: 'Odbij', icon: 'ban', danger: true, dividerBefore: true },
  ];
  protected readonly busy = signal(false);

  protected readonly resource = httpResource<Page<Submission>>(() => ({
    url: `${API_URL}/admin/facility-submissions`,
    params: { ...(this.filters.values()['status'] ? { status: this.filters.values()['status'] } : {}) },
  }));
  protected readonly items = computed(() => this.resource.value()?.data ?? []);

  protected act(item: Submission, action: string): void {
    if (action === 'approve') {
      this.#review(item, 'approve', {}, 'Podaci su objavljeni, kolega dobija mejl.');
    } else if (action === 'reject') {
      this.#reject.open().subscribe((note) => note && this.#review(item, 'reject', { note }, 'Predlog je odbijen, kolega dobija mejl.'));
    }
  }

  protected joined(group: GroupView): string {
    return group.items.map((entry) => `${entry.label}: ${entry.value}`).join('\n');
  }

  protected date(value: string | null): string {
    return value ? formatDate(value) : '';
  }

  #review(item: Submission, action: 'approve' | 'reject', body: Record<string, string>, message: string): void {
    this.busy.set(true);
    this.#http.post(`${API_URL}/admin/facility-submissions/${item.id}/${action}`, body).subscribe({
      next: () => {
        this.busy.set(false);
        this.#notifications.show(message);
        this.resource.reload();
      },
      error: (error) => {
        this.busy.set(false);
        this.#notifications.show(apiErrorMessage(error));
      },
    });
  }
}
