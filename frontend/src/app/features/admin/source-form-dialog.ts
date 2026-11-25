import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { FEED_SOURCE_TYPE_LABELS, FeedSourceType, MANUAL_ONLY, OrganizationSource, SOURCE_MODE_LABELS, SourceMode } from './sources.model';

export interface SourceFormData {
  source: OrganizationSource | null;
  organizations: { id: number; name: string }[];
}

@Component({
  selector: 'app-source-form-dialog',
  imports: [FormsModule, MatDialogModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatSelectModule, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .source-form {
      display: grid;
      gap: 16px;
      padding-top: 4px;
    }
    mat-form-field {
      width: 100%;
    }
  `,
  template: `
    <app-dialog-shell [title]="data.source ? 'Izmena izvora' : 'Novi izvor'">
      <div class="source-form">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Organizacija</mat-label>
          <mat-select [value]="organizationId()" (selectionChange)="organizationId.set($event.value)">
            @for (organization of data.organizations; track organization.id) {
              <mat-option [value]="organization.id">{{ organization.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Vrsta</mat-label>
          <mat-select [value]="type()" (selectionChange)="type.set($event.value)">
            @for (option of types; track option) {
              <mat-option [value]="option">{{ typeLabels[option] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Adresa</mat-label>
          <input matInput type="url" maxlength="500" [ngModel]="url()" (ngModelChange)="url.set($event)" />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Praćenje</mat-label>
          <mat-select [value]="mode()" (selectionChange)="mode.set($event.value)">
            @for (option of modes; track option) {
              <mat-option [value]="option" [disabled]="option === 'auto' && manualOnly()">{{ modeLabels[option] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <p class="small muted">
          @if (manualOnly()) {
            Facebook i Instagram ne dozvoljavaju automatsko čitanje: urednik ih povremeno pogleda sam.
          } @else if (type() === 'youtube') {
            YouTube u robots.txt zabranjuje čitanje fida kanala, pa automatska provera javlja „Zabranjeno”; pratite ga ručno.
          } @else {
            Za sajt tražimo RSS fid (WordPress ga ima na /feed/) i poštujemo robots.txt.
          }
        </p>
        @if (error(); as message) {
          <p class="danger-text small" role="alert">{{ message }}</p>
        }
      </div>
      <ng-container dialogActions>
        <button type="button" mat-button [mat-dialog-close]="null">Otkaži</button>
        <button type="button" mat-flat-button [disabled]="!canSave()" (click)="save()">{{ data.source ? 'Sačuvaj' : 'Dodaj' }}</button>
      </ng-container>
    </app-dialog-shell>
  `,
})
export class SourceFormDialog {
  readonly #http = inject(HttpClient);
  readonly #dialogRef = inject<MatDialogRef<SourceFormDialog, OrganizationSource | null>>(MatDialogRef);

  protected readonly data = inject<SourceFormData>(MAT_DIALOG_DATA);
  protected readonly typeLabels = FEED_SOURCE_TYPE_LABELS;
  protected readonly types = Object.keys(FEED_SOURCE_TYPE_LABELS) as FeedSourceType[];
  protected readonly modeLabels = SOURCE_MODE_LABELS;
  protected readonly modes = Object.keys(SOURCE_MODE_LABELS) as SourceMode[];

  protected readonly organizationId = signal<number | null>(this.data.source?.organization.id ?? null);
  protected readonly type = signal<FeedSourceType>(this.data.source?.type ?? 'sajt');
  protected readonly url = signal(this.data.source?.url ?? '');
  protected readonly mode = signal<SourceMode>(this.data.source?.mode ?? 'auto');
  protected readonly error = signal('');
  protected readonly saving = signal(false);
  protected readonly manualOnly = computed(() => MANUAL_ONLY.includes(this.type()));
  protected readonly canSave = computed(() => !this.saving() && !!this.organizationId() && /^https?:\/\/\S+$/.test(this.url().trim()));

  constructor() {
    effect(() => {
      if (this.manualOnly()) {
        this.mode.set('manual');
      }
    });
  }

  protected save(): void {
    if (!this.canSave()) {
      return;
    }
    const payload = { organization_id: this.organizationId(), type: this.type(), url: this.url().trim(), mode: this.mode() };
    const request = this.data.source
      ? this.#http.patch<OrganizationSource>(`${API_URL}/admin/sources/${this.data.source.id}`, payload)
      : this.#http.post<OrganizationSource>(`${API_URL}/admin/sources`, payload);
    this.saving.set(true);
    this.error.set('');
    request.subscribe({
      next: (saved) => this.#dialogRef.close(saved),
      error: (error) => {
        this.saving.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}
