import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { Icon } from '../../shared/icon/icon';
import { Debate, POST_KIND_ICONS, POST_KIND_LABELS, PostKind, ReopenRequest } from './debate.model';

@Component({
  selector: 'app-reopen-request-dialog',
  imports: [FormsModule, MatDialogModule, MatInputModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, DialogShell, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell title="Zatraži da se tema ponovo otvori">
      <p class="muted mb-3">
        Tema „{{ debate.title }}“ je zatvorena, a sažetak i zaključci su zamrznuti. Napiši šta želiš da kažeš: moderator dobija mejl i,
        ako odobri, tema se ponovo otvara i tvoj prilog se objavljuje. Javićemo ti mejlom šta je moderator odlučio.
      </p>
      <div class="chip-row mb-3" role="group" aria-label="Vrsta priloga">
        @for (option of kinds; track option) {
          <button type="button" [matButton]="kind() === option ? 'filled' : 'outlined'" [theme]="kind() === option ? 'primary' : 'tertiary'" size="sm" [attr.aria-pressed]="kind() === option" (click)="kind.set(option)">
            <app-icon [name]="kindIcons[option]" [size]="16" /> {{ kindLabels[option] }}
          </button>
        }
      </div>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Šta želiš da kažeš o ovoj temi</mat-label>
        <textarea matInput rows="6" maxlength="5000" [ngModel]="body()" (ngModelChange)="body.set($event)"></textarea>
      </mat-form-field>
      @if (error(); as text) {
        <p class="form-error" role="alert">{{ text }}</p>
      }
      <ng-container dialogActions>
        <button type="button" mat-stroked-button mat-dialog-close>Odustani</button>
        <button type="button" mat-flat-button [disabled]="busy() || body().trim().length < 10" (click)="send()">Pošalji zahtev</button>
      </ng-container>
    </app-dialog-shell>
  `,
  styles: `
    mat-form-field {
      width: 100%;
    }
  `,
})
export class ReopenRequestDialog {
  readonly #http = inject(HttpClient);
  readonly #ref = inject(MatDialogRef<ReopenRequestDialog, string>);
  protected readonly debate = inject<Debate>(MAT_DIALOG_DATA);

  protected readonly kinds = Object.keys(POST_KIND_LABELS) as PostKind[];
  protected readonly kindLabels = POST_KIND_LABELS;
  protected readonly kindIcons = POST_KIND_ICONS;
  protected readonly kind = signal<PostKind>('statement');
  protected readonly body = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected send(): void {
    this.busy.set(true);
    this.error.set(null);
    this.#http.post<ReopenRequest & { message: string }>(`${API_URL}/debates/${this.debate.slug}/reopen-requests`, { kind: this.kind(), body: this.body().trim() }).subscribe({
      next: (response) => this.#ref.close(response.message),
      error: (error) => {
        this.busy.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}
