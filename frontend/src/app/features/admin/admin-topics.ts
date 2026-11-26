import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { DeleteService } from '../../core/delete.service';
import { API_URL } from '../../core/http/api';
import { ListHeader } from '../../shared/list-header/list-header';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { Topic } from '../articles/article.model';
import { TopicDialog } from './topic-dialog';

type TopicAction = 'view' | 'edit' | 'remove';

@Component({
  selector: 'app-admin-topics',
  imports: [BUTTON_IMPORTS, MatProgressBarModule, ListHeader, OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="muted mb-4">Teme kolumni i autorskih tekstova. Čitaoci ih vide kao filter na stranici „Priče kolega”, a autor bira temu kad piše.</p>
    <app-list-header [count]="topics().length">
      <button type="button" mat-flat-button (click)="open(null)">Nova tema</button>
    </app-list-header>
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <div class="admin-rows">
      @for (topic of topics(); track topic.id) {
        <div class="admin-row admin-row-compact">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              <span class="state-chip state-muted">tekstova: {{ topic.articles_count ?? 0 }}</span>
              <span>redosled {{ topic.sort }}</span>
            </span>
            <strong>{{ topic.name }}</strong>
            @if (topic.description) {
              <span class="small muted">{{ topic.description }}</span>
            }
          </div>
          <app-options-menu [options]="menu(topic)" [label]="'Opcije za: ' + topic.name" (selected)="onAction(topic, $event)" />
        </div>
      }
    </div>
  `,
})
export class AdminTopics {
  readonly #dialog = inject(MatDialog);
  readonly #delete = inject(DeleteService);

  protected readonly resource = httpResource<Topic[]>(() => `${API_URL}/admin/topics`);
  protected readonly topics = computed(() => (this.resource.hasValue() ? this.resource.value() : []));

  protected menu(topic: Topic): MenuOption<TopicAction>[] {
    return [
      { value: 'view', label: 'Tekstovi u temi', icon: 'eye', href: `/tekstovi?tema=${encodeURIComponent(topic.slug)}`, newTab: true },
      { value: 'edit', label: 'Izmeni', icon: 'edit' },
      { value: 'remove', label: 'Obriši', icon: 'trash', danger: true, dividerBefore: true },
    ];
  }

  protected open(topic: Topic | null): void {
    this.#dialog
      .open(TopicDialog, { data: topic, width: '520px', maxWidth: '100vw', panelClass: 'app-dialog-panel', autoFocus: false })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) {
          this.resource.reload();
        }
      });
  }

  protected onAction(topic: Topic, action: string): void {
    if (action === 'edit') {
      this.open(topic);
    } else if (action === 'remove') {
      this.#delete.confirmDelete(
        { title: 'Brisanje teme', message: `Obrisati temu „${topic.name}“? Tekstovi u njoj ostaju, samo bez teme.`, url: `${API_URL}/admin/topics/${topic.id}`, success: 'Tema je obrisana.' },
        () => this.resource.reload(),
      );
    }
  }
}
