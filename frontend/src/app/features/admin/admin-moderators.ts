import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { ROLE_LABELS, UserRole } from '../../core/auth/user.model';
import { formatDate } from '../../core/content/content.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { ListHeader } from '../../shared/list-header/list-header';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { UserPickerData, UserPickerDialog } from './user-picker-dialog';

interface ModeratorRow {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  in_pool: boolean;
  blocked: boolean;
  open: number;
  proposed: number;
  closed: number;
  posts_open: number;
  pending_summaries: number;
  pending_requests: number;
  last_assigned_at: string | null;
}

interface LogEntry {
  id: number;
  debate: { slug: string; title: string } | null;
  moderator: string | null;
  previous: string | null;
  assigned_by: string | null;
  reason: 'auto' | 'manual' | 'creator';
  created_at: string | null;
}

const REASON_LABELS: Record<LogEntry['reason'], string> = {
  auto: 'automatski',
  manual: 'ručno',
  creator: 'otvorio temu',
};

@Component({
  selector: 'app-admin-moderators',
  imports: [RouterLink, MatProgressBarModule, BUTTON_IMPORTS, ListHeader, OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="small muted mb-3">
      Nova tema automatski dobija moderatora iz rotacije koji ima najmanje aktivnih tema (otvorene i na čekanju). Ako u rotaciji nema
      nikoga, bira se urednik, pa admin. Svaka dodela i promena se upisuje u evidenciju ispod.
    </p>
    @if (moderators.value(); as data) {
      <div class="next-moderator mb-3">
        Sledeći na redu: <strong>{{ data.next?.name ?? 'niko' }}</strong>
        <span class="small muted"> · u rotaciji: {{ data.pool_size }}{{ data.pool_size ? '' : ' (biraju se urednici)' }}</span>
      </div>
    }
    <app-list-header [count]="rows().length" label="Moderatora">
      <button type="button" mat-flat-button (click)="addToPool()">Dodaj u rotaciju</button>
    </app-list-header>
    @if (moderators.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <div class="admin-rows mb-5">
      @for (row of rows(); track row.id) {
        <div class="admin-row admin-row-compact">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              <span class="state-chip" [class]="row.in_pool ? 'state-ok' : 'state-muted'">{{ row.in_pool ? 'u rotaciji' : 'van rotacije' }}</span>
              <span>{{ roleLabels[row.role] }}</span>
              @if (row.last_assigned_at) {
                <span>poslednja dodela {{ date(row.last_assigned_at) }}</span>
              }
              @if (row.blocked) {
                <span class="state-chip state-warn">blokiran</span>
              }
            </span>
            <span class="moderator-name"><strong>{{ row.name }}</strong> <span class="small muted">{{ row.email }}</span></span>
            <div class="load" [attr.aria-label]="'Opterećenje: ' + (row.open + row.proposed) + ' aktivnih tema'">
              <span class="load-bar"><span [style.width.%]="share(row)"></span></span>
              <span class="small">
                {{ row.open }} otvorenih · {{ row.proposed }} na čekanju · {{ row.closed }} zatvorenih · {{ row.posts_open }} priloga u otvorenim
                @if (row.pending_summaries) {
                  · <span class="warn-text">{{ row.pending_summaries }} nacrt sažetka</span>
                }
                @if (row.pending_requests) {
                  · <span class="warn-text">{{ row.pending_requests }} zahteva za otvaranje</span>
                }
              </span>
            </div>
          </div>
          <app-options-menu [options]="menuFor(row)" [label]="'Opcije za: ' + row.name" (selected)="setPool(row, $event === 'add')" />
        </div>
      } @empty {
        @if (!moderators.isLoading()) {
          <p class="muted">Još nema moderatora. Dodaj urednike ili iskusne kolege u rotaciju.</p>
        }
      }
    </div>

    <h2 class="mb-2">Evidencija dodela</h2>
    <div class="moderator-log">
      @for (entry of log(); track entry.id) {
        <p class="small">
          <span class="muted">{{ entry.created_at ? date(entry.created_at) : '' }}</span>
          ·
          @if (entry.debate; as debate) {
            <a class="inline-link" [routerLink]="['/debate', debate.slug]">{{ debate.title }}</a>
          } @else {
            obrisana tema
          }
          → <strong>{{ entry.moderator ?? 'niko' }}</strong>
          ({{ reasonLabels[entry.reason] }}{{ entry.assigned_by ? ', ' + entry.assigned_by : '' }}{{ entry.previous ? ', pre: ' + entry.previous : '' }})
        </p>
      } @empty {
        <p class="small muted">Evidencija je prazna.</p>
      }
    </div>
  `,
  styles: `
    .next-moderator {
      padding: 12px 16px;
      border: 1px solid var(--color-border);
      border-left: 4px solid var(--color-lime);
      border-radius: var(--radius);
      background: var(--color-surface);
    }
    .moderator-name {
      overflow-wrap: anywhere;
    }
    .load {
      display: grid;
      gap: 4px;
    }
    .load-bar {
      display: block;
      height: 6px;
      max-width: 320px;
      border-radius: 3px;
      background: var(--color-surface-alt);
      overflow: hidden;
    }
    .load-bar span {
      display: block;
      height: 100%;
      background: var(--color-primary);
    }
    .moderator-log p {
      margin: 0 0 8px;
      overflow-wrap: anywhere;
    }
  `,
})
export class AdminModerators {
  readonly #http = inject(HttpClient);
  readonly #dialog = inject(MatDialog);
  readonly #notifications = inject(NotificationService);

  protected readonly roleLabels = ROLE_LABELS;
  protected readonly reasonLabels = REASON_LABELS;
  protected readonly moderators = httpResource<{ data: ModeratorRow[]; next: { id: number; name: string } | null; pool_size: number }>(() => `${API_URL}/admin/moderators`);
  readonly #log = httpResource<LogEntry[]>(() => `${API_URL}/admin/moderators/log`);
  protected readonly rows = computed(() =>
    [...(this.moderators.value()?.data ?? [])].sort((a, b) => Number(b.in_pool) - Number(a.in_pool) || b.open + b.proposed - (a.open + a.proposed) || a.name.localeCompare(b.name, 'sr')),
  );
  protected readonly log = computed(() => this.#log.value() ?? []);
  readonly #max = computed(() => Math.max(1, ...this.rows().map((row) => row.open + row.proposed)));

  protected share(row: ModeratorRow): number {
    return Math.round(((row.open + row.proposed) / this.#max()) * 100);
  }

  protected date(value: string): string {
    return formatDate(value);
  }

  protected menuFor(row: ModeratorRow): MenuOption<'add' | 'remove'>[] {
    return row.in_pool
      ? [{ value: 'remove', label: 'Isključi iz rotacije', icon: 'ban' }]
      : [{ value: 'add', label: 'Uključi u rotaciju', icon: 'check', disabled: row.blocked }];
  }

  protected addToPool(): void {
    this.#dialog
      .open<UserPickerDialog, UserPickerData, number>(UserPickerDialog, {
        data: {
          title: 'Dodaj moderatora u rotaciju',
          intro: 'Izaberi člana koji će dobijati nove teme po redu. Može da bude urednik ili iskusan kolega sa bilo kojom ulogom; moderator vidi alate samo u temama koje su mu dodeljene.',
          confirmLabel: 'Dodaj u rotaciju',
          exclude: this.rows().filter((row) => row.in_pool).map((row) => row.id),
        },
        width: '560px',
        maxWidth: '100vw',
        panelClass: 'app-dialog-panel',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((id) => id && this.#update(id, true));
  }

  protected setPool(row: ModeratorRow, inPool: boolean): void {
    this.#update(row.id, inPool);
  }

  #update(id: number, inPool: boolean): void {
    this.#http.patch<{ message: string }>(`${API_URL}/admin/moderators/${id}`, { in_pool: inPool }).subscribe({
      next: (response) => {
        this.#notifications.show(response.message);
        this.moderators.reload();
      },
      error: (error) => this.#notifications.show(apiErrorMessage(error)),
    });
  }
}
