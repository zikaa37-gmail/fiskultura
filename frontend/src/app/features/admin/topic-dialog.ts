import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { Topic } from '../articles/article.model';

@Component({
  selector: 'app-topic-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatInputModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="topic ? 'Izmena teme' : 'Nova tema'">
      <form class="admin-form" [formGroup]="form" (ngSubmit)="save()">
        <mat-form-field appearance="outline">
          <mat-label>Naziv</mat-label>
          <input matInput formControlName="name" maxlength="120" />
        </mat-form-field>
        <mat-form-field subscriptSizing="dynamic" appearance="outline">
          <mat-label>Kratak opis (nije obavezno)</mat-label>
          <textarea matInput formControlName="description" rows="3" maxlength="500"></textarea>
          <mat-hint>O čemu autori pišu u ovoj temi.</mat-hint>
        </mat-form-field>
        <mat-form-field subscriptSizing="dynamic" appearance="outline">
          <mat-label>Redosled</mat-label>
          <input matInput formControlName="sort" type="number" min="0" />
          <mat-hint>Manji broj ide ranije u listi.</mat-hint>
        </mat-form-field>
        @if (error(); as message) {
          <p class="form-error" role="alert">{{ message }}</p>
        }
      </form>
      <ng-container dialogActions>
        <button type="button" mat-button [mat-dialog-close]="false">Otkaži</button>
        <button type="button" mat-flat-button [disabled]="busy()" (click)="save()">Sačuvaj</button>
      </ng-container>
    </app-dialog-shell>
  `,
})
export class TopicDialog {
  readonly #http = inject(HttpClient);
  readonly #dialogRef = inject<MatDialogRef<TopicDialog, boolean>>(MatDialogRef);

  protected readonly topic = inject<Topic | null>(MAT_DIALOG_DATA);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [this.topic?.name ?? '', Validators.required],
    description: [this.topic?.description ?? ''],
    sort: [this.topic ? `${this.topic.sort}` : ''],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload = { name: value.name, description: value.description || null, sort: `${value.sort}` === '' ? null : Number(value.sort) };
    const request = this.topic ? this.#http.patch(`${API_URL}/admin/topics/${this.topic.id}`, payload) : this.#http.post(`${API_URL}/admin/topics`, payload);
    this.busy.set(true);
    this.error.set(null);
    request.subscribe({
      next: () => this.#dialogRef.close(true),
      error: (error) => {
        this.busy.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}
