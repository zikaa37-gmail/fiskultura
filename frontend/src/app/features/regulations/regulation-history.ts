import { ChangeDetectionStrategy, Component, computed, inject, Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { API_URL } from '../../core/http/api';
import { formatDate } from '../../core/content/content.model';
import { Regulation, REGULATION_KIND_LABELS } from '../../core/content/regulation.model';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { SimpleMarkdownPipe } from '../../shared/simple-markdown.pipe';

@Component({
  selector: 'app-regulation-history',
  imports: [MatDialogModule, BUTTON_IMPORTS, MatProgressBarModule, DialogShell, SimpleMarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="'Istorija izmena'">
      <span class="post-meta" dialogMeta>{{ data.title }}</span>
      @if (resource.isLoading()) {
        <mat-progress-bar mode="indeterminate" />
      } @else if (regulation(); as item) {
        <div class="history-list">
          <section class="history-item history-current">
            <strong>Verzija {{ item.version }} — važeća</strong>
            <span class="muted small">poslednja izmena {{ date(item.updated_at) }}</span>
          </section>
          @for (version of item.history ?? []; track version.version) {
            <section class="history-item">
              <strong>Verzija {{ version.version }}</strong>
              <span class="muted small">
                zamenjena {{ date(version.replaced_at) }}@if (version.replaced_by) { · {{ version.replaced_by }} }
              </span>
              @if (version.note) {
                <p>Šta je promenjeno: {{ version.note }}</p>
              }
              <details>
                <summary>Prikaži tekst verzije {{ version.version }}</summary>
                @if (version.data.title) {
                  <p><strong>{{ version.data.title }}</strong>@if (version.data.kind) { · {{ kindLabels[version.data.kind] }} }</p>
                }
                @if (version.data.gazette) {
                  <p class="muted small">{{ version.data.gazette }}</p>
                }
                <div class="markdown" [innerHTML]="version.data.summary | simpleMarkdown"></div>
              </details>
            </section>
          } @empty {
            <p class="muted">Propis nije menjan od unosa.</p>
          }
        </div>
      }
      <ng-container dialogActions>
        <button type="button" mat-flat-button mat-dialog-close>Zatvori</button>
      </ng-container>
    </app-dialog-shell>
  `,
})
export class RegulationHistory {
  protected readonly data = inject<{ key: string; title: string }>(MAT_DIALOG_DATA);
  protected readonly resource = httpResource<Regulation>(() => `${API_URL}/regulations/${encodeURIComponent(this.data.key)}`);
  protected readonly regulation = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  protected readonly kindLabels = REGULATION_KIND_LABELS;

  protected date(value: string | null): string {
    return formatDate(value);
  }
}

@Injectable({ providedIn: 'root' })
export class RegulationHistoryService {
  readonly #dialog = inject(MatDialog);

  open(key: string, title: string): void {
    this.#dialog.open(RegulationHistory, { data: { key, title }, width: '720px', maxWidth: '100vw', panelClass: ['app-dialog-panel', 'news-dialog-panel'], autoFocus: false });
  }
}
