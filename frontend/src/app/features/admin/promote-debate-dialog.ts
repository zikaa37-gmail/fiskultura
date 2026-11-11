import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { formatDate } from '../../core/content/content.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { AdminDebate, DebatePromotion } from '../debates/debate.model';

interface PromotionInfo {
  recipients: number;
  last: DebatePromotion | null;
  hourly_limit: number;
}

@Component({
  selector: 'app-promote-debate-dialog',
  imports: [FormsModule, MatDialogModule, MatInputModule, MatProgressBarModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell title="Pozovi članove u raspravu">
      @if (info.isLoading()) {
        <mat-progress-bar mode="indeterminate" />
      }
      @if (info.value(); as data) {
        <p class="mb-3">
          Tema: <strong>{{ debate.title }}</strong>. Mejl dobija <strong>{{ data.recipients }}</strong> članova sa uključenim obaveštenjima; ko se
          odjavio, ne dobija ništa, a svaki mejl ima link za odjavu. Šalje se postepeno, najviše {{ data.hourly_limit }} na sat, zajedno sa
          obaveštenjima o vestima.
        </p>
        @if (data.last; as last) {
          <p class="small muted mb-3">
            Prethodni poziv {{ last.created_at ? date(last.created_at) : '' }}:
            {{ last.finished ? 'poslat' : 'još se šalje' }}, {{ last.sent }} od {{ last.recipients }}{{ last.failed ? ', neuspelih ' + last.failed : '' }}.
          </p>
        }
      }
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Poruka (teaser)</mat-label>
        <textarea matInput rows="6" maxlength="1500" [ngModel]="message()" (ngModelChange)="message.set($event)"></textarea>
      </mat-form-field>
      <p class="small muted">Ispod poruke mejl ima naslov i opis teme i dugme „Uključi se u raspravu”.</p>
      @if (error(); as text) {
        <p class="form-error" role="alert">{{ text }}</p>
      }
      <ng-container dialogActions>
        <button type="button" mat-stroked-button mat-dialog-close>Odustani</button>
        <button type="button" mat-flat-button [disabled]="!canSend()" (click)="send()">Pošalji {{ info.value()?.recipients ?? '' }} poziva</button>
      </ng-container>
    </app-dialog-shell>
  `,
  styles: `
    mat-form-field {
      width: 100%;
    }
  `,
})
export class PromoteDebateDialog {
  readonly #http = inject(HttpClient);
  readonly #ref = inject(MatDialogRef<PromoteDebateDialog, string>);
  protected readonly debate = inject<AdminDebate>(MAT_DIALOG_DATA);

  protected readonly info = httpResource<PromotionInfo>(() => `${API_URL}/admin/debates/${this.debate.id}/promotion`);
  protected readonly message = signal(
    `Kolege, otvorili smo stručnu debatu „${this.debate.title}“. Vaše iskustvo iz škole je ovde najvrednije: napišite šta mislite, pitajte, kritikujte ili predložite rešenje. Moderator na kraju objavljuje sažetak rasprave za sve koji nemaju vremena da čitaju svaki prilog.`,
  );
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly canSend = computed(() => {
    const data = this.info.value();
    return !this.busy() && !!data && data.recipients > 0 && !(data.last && !data.last.finished) && this.message().trim().length >= 20;
  });

  protected date(value: string): string {
    return formatDate(value);
  }

  protected send(): void {
    this.busy.set(true);
    this.error.set(null);
    this.#http.post<DebatePromotion & { message_text: string }>(`${API_URL}/admin/debates/${this.debate.id}/promotions`, { message: this.message().trim() }).subscribe({
      next: (promotion) => this.#ref.close(promotion.message_text),
      error: (error) => {
        this.busy.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}
