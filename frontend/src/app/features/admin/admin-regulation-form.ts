import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import {
  Regulation,
  REGULATION_AREA_LABELS,
  REGULATION_KIND_LABELS,
  RegulationArea,
  RegulationKind,
  RegulationPayload,
  Verification,
  VERIFICATION_LABELS,
} from '../../core/content/regulation.model';
import { SimpleMarkdownPipe } from '../../shared/simple-markdown.pipe';

@Component({
  selector: 'app-admin-regulation-form',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatSelectModule, SimpleMarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="inline-link small" routerLink="/admin/propisi">← Svi propisi</a>
    @if (isEdit() && resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <form class="admin-form" [formGroup]="form" (ngSubmit)="save()">
      <div class="admin-form-head">
        <h2>{{ isEdit() ? 'Izmena propisa' : 'Novi propis' }}</h2>
        @if (loaded(); as item) {
          <span class="state-chip state-muted">verzija {{ item.version }}</span>
        }
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Naziv</mat-label>
        <textarea matInput formControlName="title" rows="2"></textarea>
      </mat-form-field>
      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Vrsta</mat-label>
          <mat-select formControlName="kind">
            @for (option of kinds; track option) {
              <mat-option [value]="option">{{ kindLabels[option] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Oblasti</mat-label>
          <mat-select formControlName="areas" multiple>
            @for (option of areas; track option) {
              <mat-option [value]="option">{{ areaLabels[option] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Službeni glasnik (brojevi)</mat-label>
        <input matInput formControlName="gazette" placeholder="„Sl. glasnik RS“ 88/2017, …" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Link na tekst</mat-label>
        <input matInput formControlName="url" type="url" placeholder="https://..." />
      </mat-form-field>
      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Važi od</mat-label>
          <input matInput formControlName="valid_from" type="date" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Važi do</mat-label>
          <input matInput formControlName="valid_to" type="date" />
        </mat-form-field>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Šta je bitno za FV</mat-label>
        <textarea matInput formControlName="summary" rows="10"></textarea>
        <mat-hint>Redovi koji počinju sa „- “ postaju lista, **tekst** je podebljan, [naziv](https://...) je link.</mat-hint>
      </mat-form-field>
      @if (form.controls.summary.value) {
        <details class="regulation-summary">
          <summary>Pregled</summary>
          <div class="markdown" [innerHTML]="form.controls.summary.value | simpleMarkdown"></div>
        </details>
      }
      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Proverenost</mat-label>
          <mat-select formControlName="verification">
            @for (option of verifications; track option) {
              <mat-option [value]="option">{{ verificationLabels[option] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Napomena o proveri</mat-label>
          <input matInput formControlName="verification_note" />
        </mat-form-field>
      </div>
      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Ključ (adresa)</mat-label>
          <input matInput formControlName="key" />
          <mat-hint>mala slova, brojevi i crtice, npr. ocenjivanje-os-2024</mat-hint>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Redosled</mat-label>
          <input matInput formControlName="sort" type="number" min="0" />
        </mat-form-field>
      </div>
      @if (isEdit()) {
        <mat-form-field appearance="outline">
          <mat-label>Šta je promenjeno (ide u istoriju izmena)</mat-label>
          <input matInput formControlName="change_note" placeholder="npr. izmena „Sl. glasnik RS“ 19/2025" />
        </mat-form-field>
      }

      @if (error(); as message) {
        <p class="form-error" role="alert">{{ message }}</p>
      }
      <div class="admin-form-actions">
        <button type="submit" mat-flat-button [disabled]="busy()">Sačuvaj</button>
        <a mat-button routerLink="/admin/propisi">Otkaži</a>
      </div>
    </form>
  `,
})
export class AdminRegulationForm {
  readonly key = input<string>();

  readonly #http = inject(HttpClient);
  readonly #router = inject(Router);
  readonly #notifications = inject(NotificationService);

  protected readonly kindLabels = REGULATION_KIND_LABELS;
  protected readonly kinds = Object.keys(REGULATION_KIND_LABELS) as RegulationKind[];
  protected readonly areaLabels = REGULATION_AREA_LABELS;
  protected readonly areas = Object.keys(REGULATION_AREA_LABELS) as RegulationArea[];
  protected readonly verificationLabels = VERIFICATION_LABELS;
  protected readonly verifications = Object.keys(VERIFICATION_LABELS) as Verification[];

  protected readonly isEdit = computed(() => !!this.key());
  protected readonly resource = httpResource<Regulation>(() => (this.key() ? `${API_URL}/regulations/${encodeURIComponent(this.key()!)}` : undefined));
  protected readonly loaded = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    title: ['', Validators.required],
    kind: ['pravilnik' as RegulationKind, Validators.required],
    areas: [[] as RegulationArea[], Validators.required],
    gazette: [''],
    url: [''],
    valid_from: [''],
    valid_to: [''],
    summary: ['', Validators.required],
    verification: ['unverified' as Verification, Validators.required],
    verification_note: [''],
    key: ['', Validators.required],
    sort: [null as number | null],
    change_note: [''],
  });

  constructor() {
    effect(() => {
      const item = this.loaded();
      if (item) {
        this.form.reset({
          title: item.title,
          kind: item.kind,
          areas: item.areas,
          gazette: item.gazette ?? '',
          url: item.url ?? '',
          valid_from: item.valid_from ?? '',
          valid_to: item.valid_to ?? '',
          summary: item.summary,
          verification: item.verification,
          verification_note: item.verification_note ?? '',
          key: item.key,
          sort: item.sort,
          change_note: '',
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
    const payload: RegulationPayload = {
      ...value,
      gazette: nullable(value.gazette),
      url: nullable(value.url),
      valid_from: nullable(value.valid_from),
      valid_to: nullable(value.valid_to),
      verification_note: nullable(value.verification_note),
      change_note: nullable(value.change_note),
    };
    const item = this.loaded();
    const request = item
      ? this.#http.patch<Regulation>(`${API_URL}/admin/regulations/${item.id}`, payload)
      : this.#http.post<Regulation>(`${API_URL}/admin/regulations`, payload);

    this.busy.set(true);
    this.error.set(null);
    request.subscribe({
      next: (saved) => {
        this.busy.set(false);
        this.#notifications.show(item && saved.version > item.version ? `Propis je sačuvan kao verzija ${saved.version}.` : 'Propis je sačuvan.');
        if (saved.key !== this.key()) {
          this.#router.navigate(['/admin/propisi', saved.key]);
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
