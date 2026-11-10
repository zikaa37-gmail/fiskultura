import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Regulation } from '../../core/content/regulation.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { SimpleMarkdownPipe } from '../../shared/simple-markdown.pipe';
import {
  AdminQuestion,
  AdminQuestionPayload,
  QUESTION_CATEGORY_LABELS,
  QUESTION_STATUS_LABELS,
  QuestionCategory,
  QuestionStatus,
} from '../questions/question.model';

@Component({
  selector: 'app-admin-question-form',
  imports: [ReactiveFormsModule, RouterLink, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatProgressBarModule, MatSelectModule, SimpleMarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .original {
      margin: 0 0 16px;
      padding: 12px 16px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      white-space: pre-wrap;
    }
  `,
  template: `
    <a class="inline-link small" routerLink="/admin/pitanja">← Sva pitanja</a>
    @if (isEdit() && resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <form class="admin-form" [formGroup]="form" (ngSubmit)="save()">
      <div class="admin-form-head">
        <h2>{{ isEdit() ? 'Pitanje i odgovor' : 'Novo pitanje i odgovor' }}</h2>
        @if (loaded(); as item) {
          <span class="state-chip state-muted">{{ statusLabels[item.status] }}</span>
        }
      </div>

      @if (loaded(); as item) {
        @if (item.original) {
          <p class="muted small">Originalno pitanje{{ item.asker ? ' — ' + item.asker.name + ' (' + item.asker.email + ')' : '' }}; vidi ga samo urednik:</p>
          <p class="original">{{ item.original }}</p>
        }
        @if (item.asker_notified_at) {
          <p class="muted small">Pitalac je obavešten mejlom o odgovoru.</p>
        } @else if (item.asker) {
          <p class="muted small">Kad pitanje bude objavljeno, pitalac dobija mejl sa linkom na odgovor.</p>
        }
      }

      <mat-form-field appearance="outline">
        <mat-label>Pitanje (javno, bez imena i škole)</mat-label>
        <textarea matInput formControlName="title" rows="2"></textarea>
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Detalji pitanja (javno, nije obavezno)</mat-label>
        <textarea matInput formControlName="body" rows="3"></textarea>
        <mat-hint>Uklonite imena, školu i sve po čemu se pitalac može prepoznati.</mat-hint>
      </mat-form-field>
      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Oblast</mat-label>
          <mat-select formControlName="category">
            @for (option of categories; track option) {
              <mat-option [value]="option">{{ categoryLabels[option] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Važi na dan</mat-label>
          <input matInput formControlName="valid_on" type="date" />
        </mat-form-field>
      </div>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Odgovor</mat-label>
        <textarea matInput formControlName="answer" rows="10"></textarea>
        <mat-hint>Redovi koji počinju sa „- “ postaju lista, **tekst** je podebljan, [naziv](https://...) je link. Navedite član propisa.</mat-hint>
      </mat-form-field>
      @if (form.controls.answer.value) {
        <details class="regulation-summary">
          <summary>Pregled odgovora</summary>
          <div class="markdown" [innerHTML]="form.controls.answer.value | simpleMarkdown"></div>
        </details>
      }
      <mat-form-field appearance="outline">
        <mat-label>Propisi na koje se odgovor poziva</mat-label>
        <mat-select formControlName="regulation_keys" multiple>
          @for (regulation of regulations(); track regulation.key) {
            <mat-option [value]="regulation.key">{{ regulation.title }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            @for (option of statuses; track option) {
              <mat-option [value]="option">{{ statusLabels[option] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Adresa (slug)</mat-label>
          <input matInput formControlName="slug" />
        </mat-form-field>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Interna napomena urednika</mat-label>
        <textarea matInput formControlName="editor_note" rows="2"></textarea>
      </mat-form-field>

      @if (error(); as message) {
        <p class="form-error" role="alert">{{ message }}</p>
      }
      <div class="admin-form-actions">
        <button type="submit" mat-flat-button [disabled]="busy()">Sačuvaj</button>
        @if (loaded()?.status === 'published') {
          <a mat-stroked-button [routerLink]="['/pitanja', loaded()!.slug]">Pogledaj javno</a>
        }
        <a mat-button routerLink="/admin/pitanja">Otkaži</a>
      </div>
    </form>
  `,
})
export class AdminQuestionForm {
  readonly id = input<string>();

  readonly #http = inject(HttpClient);
  readonly #router = inject(Router);
  readonly #notifications = inject(NotificationService);

  protected readonly categoryLabels = QUESTION_CATEGORY_LABELS;
  protected readonly categories = Object.keys(QUESTION_CATEGORY_LABELS) as QuestionCategory[];
  protected readonly statusLabels = QUESTION_STATUS_LABELS;
  protected readonly statuses = Object.keys(QUESTION_STATUS_LABELS) as QuestionStatus[];

  protected readonly isEdit = computed(() => !!this.id());
  protected readonly resource = httpResource<AdminQuestion>(() => (this.id() ? `${API_URL}/admin/questions/${this.id()}` : undefined));
  protected readonly loaded = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  readonly #regulations = httpResource<Regulation[]>(() => `${API_URL}/regulations`);
  protected readonly regulations = computed(() => (this.#regulations.hasValue() ? this.#regulations.value() : []));
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    title: ['', Validators.required],
    body: [''],
    category: ['ostalo' as QuestionCategory, Validators.required],
    valid_on: [new Date().toISOString().slice(0, 10)],
    answer: [''],
    regulation_keys: [[] as string[]],
    status: ['published' as QuestionStatus, Validators.required],
    slug: [''],
    editor_note: [''],
  });

  constructor() {
    effect(() => {
      const item = this.loaded();
      if (item) {
        this.form.reset({
          title: item.title,
          body: item.body ?? '',
          category: item.category,
          valid_on: item.valid_on ?? new Date().toISOString().slice(0, 10),
          answer: item.answer ?? '',
          regulation_keys: item.regulation_keys,
          status: item.status === 'pending' ? 'published' : item.status,
          slug: item.slug,
          editor_note: item.editor_note ?? '',
        });
      }
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const nullable = (text: string) => text.trim() || null;
    const payload: AdminQuestionPayload = {
      ...value,
      body: nullable(value.body),
      answer: nullable(value.answer),
      valid_on: nullable(value.valid_on),
      slug: nullable(value.slug),
      editor_note: nullable(value.editor_note),
    };
    const item = this.loaded();
    const request = item
      ? this.#http.patch<AdminQuestion>(`${API_URL}/admin/questions/${item.id}`, payload)
      : this.#http.post<AdminQuestion>(`${API_URL}/admin/questions`, payload);

    this.busy.set(true);
    this.error.set(null);
    request.subscribe({
      next: (saved) => {
        this.busy.set(false);
        this.#notifications.show(saved.status === 'published' ? 'Odgovor je objavljen.' : 'Sačuvano.');
        if (!item) {
          this.#router.navigate(['/admin/pitanja', saved.id]);
        } else {
          this.resource.set(saved);
        }
      },
      error: (error) => {
        this.busy.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}
