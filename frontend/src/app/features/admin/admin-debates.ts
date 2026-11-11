import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { AuthService } from '../../core/auth/auth.service';
import { formatDate } from '../../core/content/content.model';
import { DeleteService } from '../../core/delete.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { matchesSearch, queryFilters } from '../../shared/list-filters/query-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { AdminDebate, DEBATE_STATUS_LABELS, DebateStatus } from '../debates/debate.model';
import { ProposeTopicDialogService } from '../debates/propose-topic-dialog';
import { ModeratorDialog } from './moderator-dialog';

type RowAction = 'view' | 'approve' | 'reject' | 'close' | 'open' | 'moderator' | 'remove';

@Component({
  selector: 'app-admin-debates',
  imports: [RouterLink, MatProgressBarModule, BUTTON_IMPORTS, ListFilters, ListHeader, OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-list-filters [fields]="fields()" [values]="filters.values()" emptySummary="Sve teme" (filterChange)="filters.set($event)" (clearAll)="filters.clear()" />
    <app-list-header [count]="items().length">
      <button type="button" mat-flat-button (click)="create()">Nova tema</button>
    </app-list-header>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <div class="admin-rows">
      @for (item of items(); track item.id) {
        <div class="admin-row admin-row-compact">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              <span class="state-chip" [class]="item.status === 'proposed' ? 'state-warn' : item.status === 'open' ? 'state-ok' : 'state-muted'">{{ statusLabels[item.status] }}</span>
              <span>{{ item.posts_count }} priloga</span>
              <span>moderator: {{ item.moderator?.name ?? '—' }}</span>
              @if (item.creator) {
                <span>predložio: {{ item.creator.name }}</span>
              }
              @if (item.created_at) {
                <span>{{ date(item.created_at) }}</span>
              }
              @if (item.summary_pending) {
                <span class="state-chip state-warn">nacrt sažetka</span>
              }
            </span>
            <a class="post-title" [routerLink]="['/debate', item.slug]">{{ item.title }}</a>
            @if (item.status === 'proposed' && item.description) {
              <span class="small">{{ item.description }}</span>
            }
          </div>
          <app-options-menu [options]="menuFor(item)" [label]="'Opcije za: ' + item.title" (selected)="onAction(item, $event)" />
        </div>
      } @empty {
        @if (!resource.isLoading()) {
          <p class="muted">Nema tema za ovaj izbor.</p>
        }
      }
    </div>
  `,
})
export class AdminDebates {
  protected readonly auth = inject(AuthService);
  readonly #http = inject(HttpClient);
  readonly #dialog = inject(MatDialog);
  readonly #notifications = inject(NotificationService);
  readonly #delete = inject(DeleteService);
  readonly #propose = inject(ProposeTopicDialogService);

  protected readonly statusLabels = DEBATE_STATUS_LABELS;
  protected readonly filters = queryFilters(['status', 'pretraga']);
  protected readonly resource = httpResource<{ data: AdminDebate[]; proposed: number }>(() => {
    const status = this.filters.values()['status'];
    return { url: `${API_URL}/admin/debates/list`, method: 'POST', body: { status: status in DEBATE_STATUS_LABELS ? status : null } };
  });
  readonly #proposed = computed(() => (this.resource.hasValue() ? this.resource.value().proposed : 0));
  protected readonly fields = computed<FilterField[]>(() => [
    {
      key: 'status',
      label: 'Status',
      allLabel: 'Sve',
      options: (Object.keys(DEBATE_STATUS_LABELS) as DebateStatus[]).map((value) => ({
        value,
        label: capitalize(DEBATE_STATUS_LABELS[value]) + (value === 'proposed' && this.#proposed() ? ` (${this.#proposed()})` : ''),
      })),
    },
    { key: 'pretraga', label: 'Pretraga (naziv)', type: 'search' },
  ]);
  protected readonly items = computed(() => {
    const items = this.resource.hasValue() ? this.resource.value().data : [];
    return items.filter((item) => matchesSearch(this.filters.values()['pretraga'], [item.title, item.description]));
  });

  protected date(value: string): string {
    return formatDate(value);
  }

  protected create(): void {
    this.#propose.open().afterClosed().subscribe((debate) => debate && this.resource.reload());
  }

  protected menuFor(item: AdminDebate): MenuOption<RowAction>[] {
    const options: MenuOption<RowAction>[] = [{ value: 'view', label: 'Pogledaj', icon: 'eye', link: ['/debate', item.slug] }];
    if (item.status === 'proposed' || item.status === 'rejected') {
      options.push({ value: 'approve', label: 'Odobri i otvori', icon: 'check' });
    }
    if (item.status === 'proposed') {
      options.push({ value: 'reject', label: 'Odbij predlog', icon: 'ban' });
    }
    if (item.status === 'open') {
      options.push({ value: 'close', label: 'Zatvori temu', icon: 'close' });
    }
    if (item.status === 'closed') {
      options.push({ value: 'open', label: 'Ponovo otvori', icon: 'check' });
    }
    if (this.auth.isAdmin()) {
      options.push({ value: 'moderator', label: 'Promeni moderatora', icon: 'user' });
      options.push({ value: 'remove', label: 'Obriši', icon: 'trash', danger: true, dividerBefore: true });
    }
    return options;
  }

  protected onAction(item: AdminDebate, action: RowAction): void {
    switch (action) {
      case 'approve':
      case 'open':
        this.#update(item, { status: 'open' }, action === 'approve' ? 'Tema je odobrena i otvorena.' : 'Tema je ponovo otvorena.');
        break;
      case 'reject':
        this.#update(item, { status: 'rejected' }, 'Predlog je odbijen.');
        break;
      case 'close':
        this.#update(item, { status: 'closed' }, 'Tema je zatvorena.');
        break;
      case 'moderator':
        this.#dialog
          .open<ModeratorDialog, AdminDebate, number>(ModeratorDialog, { data: item, width: '560px', maxWidth: '100vw', panelClass: 'app-dialog-panel', autoFocus: false })
          .afterClosed()
          .subscribe((id) => id && this.#update(item, { moderator_id: id }, 'Moderator je promenjen.'));
        break;
      case 'remove':
        this.#delete.confirmDelete(
          { title: 'Brisanje teme', message: `Obrisati „${item.title}“ sa svim prilozima (${item.posts_count})? Ovo ne može da se vrati.`, url: `${API_URL}/admin/debates/${item.id}` },
          () => this.resource.reload(),
        );
        break;
    }
  }

  #update(item: AdminDebate, change: Record<string, unknown>, message: string): void {
    this.#http.patch<AdminDebate>(`${API_URL}/admin/debates/${item.id}`, change).subscribe({
      next: () => {
        this.#notifications.show(message);
        this.resource.reload();
      },
      error: (error) => this.#notifications.show(apiErrorMessage(error)),
    });
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
