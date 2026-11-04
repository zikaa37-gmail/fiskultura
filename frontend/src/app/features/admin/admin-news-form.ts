import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { NEWS_CATEGORY_LABELS, NewsCategory, organizationLabel, SOURCE_TYPE_LABELS, SourceType } from '../../core/content/content.model';
import { AdminNews, AdminNewsPayload, AdminOrganization, NewsStatus, newsState, toLocalInput } from './admin.model';

@Component({
  selector: 'app-admin-news-form',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="inline-link small" routerLink="/admin/vesti">← Sve vesti</a>
    @if (isEdit() && resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <form class="admin-form" [formGroup]="form" (ngSubmit)="save()">
      <div class="admin-form-head">
        <h2>{{ isEdit() ? 'Izmena vesti' : 'Nova vest' }}</h2>
        @if (loaded(); as item) {
          @let state = stateOf(item);
          <span class="state-chip" [class]="'state-' + state.tone">{{ state.label }}</span>
          @if (item.is_visible) {
            <a class="inline-link small" [routerLink]="['/vesti', item.slug]" target="_blank">Pogledaj na sajtu →</a>
          }
        }
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Naslov</mat-label>
        <input matInput formControlName="title" maxlength="255" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Sažetak</mat-label>
        <textarea matInput formControlName="summary" rows="3" maxlength="1000"></textarea>
        <mat-hint>Svojim rečima, 1–3 rečenice. Prikazuje se u listi i ispod naslova.</mat-hint>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Tekst (nije obavezno)</mat-label>
        <textarea matInput formControlName="body" rows="10"></textarea>
        <mat-hint>Za prenete objave dovoljan je sažetak i link na izvor — ne kopirati tuđi tekst.</mat-hint>
      </mat-form-field>

      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Kategorija</mat-label>
          <mat-select formControlName="category">
            @for (option of categories; track option) {
              <mat-option [value]="option">{{ categoryLabels[option] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Organizacija (odakle je informacija)</mat-label>
          <mat-select formControlName="organization_id">
            <mat-option [value]="null">— bez organizacije —</mat-option>
            @for (item of organizations(); track item.id) {
              <mat-option [value]="item.id">{{ label(item) }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <fieldset class="admin-fieldset">
        <legend>Izvor</legend>
        <mat-form-field appearance="outline">
          <mat-label>Link na original</mat-label>
          <input matInput formControlName="source_url" type="url" placeholder="https://..." />
        </mat-form-field>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Preuzeto sa</mat-label>
            <mat-select formControlName="source_type">
              <mat-option [value]="null">—</mat-option>
              @for (option of sourceTypes; track option) {
                <mat-option [value]="option">{{ sourceLabels[option] }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Datum originalne objave</mat-label>
            <input matInput formControlName="source_published_at" type="date" />
          </mat-form-field>
        </div>
      </fieldset>

      <fieldset class="admin-fieldset">
        <legend>Objavljivanje</legend>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="draft">Nacrt (ne vidi se)</mat-option>
              <mat-option value="published">Objavljeno</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Vreme objave</mat-label>
            <input matInput formControlName="published_at" type="datetime-local" />
            <mat-hint>Prazno = odmah. Vreme u budućnosti = zakazano.</mat-hint>
          </mat-form-field>
        </div>
        <mat-checkbox formControlName="featured">Istaknuta vest</mat-checkbox>
        <mat-form-field appearance="outline">
          <mat-label>Adresa (slug, nije obavezno)</mat-label>
          <input matInput formControlName="slug" />
          <mat-hint>Pravi se iz naslova. Menjati samo ako je potrebno.</mat-hint>
        </mat-form-field>
      </fieldset>

      @if (error(); as message) {
        <p class="form-error" role="alert">{{ message }}</p>
      }
      <div class="admin-form-actions">
        <button type="submit" mat-flat-button [disabled]="busy()">Sačuvaj</button>
        <a mat-button routerLink="/admin/vesti">Otkaži</a>
      </div>
    </form>
  `,
})
export class AdminNewsForm {
  readonly id = input<string>();

  readonly #http = inject(HttpClient);
  readonly #router = inject(Router);
  readonly #notifications = inject(NotificationService);

  protected readonly categoryLabels = NEWS_CATEGORY_LABELS;
  protected readonly categories = Object.keys(NEWS_CATEGORY_LABELS) as NewsCategory[];
  protected readonly sourceLabels = SOURCE_TYPE_LABELS;
  protected readonly sourceTypes = Object.keys(SOURCE_TYPE_LABELS) as SourceType[];
  protected readonly label = organizationLabel;
  protected readonly stateOf = newsState;

  protected readonly isEdit = computed(() => !!this.id());
  protected readonly resource = httpResource<AdminNews>(() => (this.id() ? `${API_URL}/admin/news/${this.id()}` : undefined));
  protected readonly loaded = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  readonly #organizationsResource = httpResource<AdminOrganization[]>(() => `${API_URL}/admin/organizations`);
  protected readonly organizations = computed(() =>
    (this.#organizationsResource.hasValue() ? this.#organizationsResource.value() : []).slice().sort((a, b) => this.label(a).localeCompare(this.label(b), 'sr')),
  );

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    title: ['', Validators.required],
    summary: ['', Validators.required],
    body: [''],
    category: ['vest' as NewsCategory, Validators.required],
    organization_id: [null as number | null],
    source_url: [''],
    source_type: [null as SourceType | null],
    source_published_at: [''],
    status: ['draft' as NewsStatus, Validators.required],
    published_at: [''],
    featured: [false],
    slug: [''],
  });

  constructor() {
    effect(() => {
      const item = this.loaded();
      if (item) {
        this.form.reset({
          title: item.title,
          summary: item.summary,
          body: item.body ?? '',
          category: item.category,
          organization_id: item.organization_id,
          source_url: item.source_url ?? '',
          source_type: item.source_type,
          source_published_at: item.source_published_at ?? '',
          status: item.status,
          published_at: toLocalInput(item.published_at),
          featured: item.featured,
          slug: item.slug,
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
    const payload: AdminNewsPayload = {
      ...value,
      body: value.body || null,
      source_url: value.source_url || null,
      source_published_at: value.source_published_at || null,
      published_at: value.published_at ? new Date(value.published_at).toISOString() : null,
      slug: value.slug || null,
    };
    const request = this.id() ? this.#http.patch<AdminNews>(`${API_URL}/admin/news/${this.id()}`, payload) : this.#http.post<AdminNews>(`${API_URL}/admin/news`, payload);

    this.busy.set(true);
    this.error.set(null);
    request.subscribe({
      next: (saved) => {
        this.busy.set(false);
        this.#notifications.show('Vest je sačuvana.');
        if (this.id()) {
          this.resource.set(saved);
        } else {
          this.#router.navigate(['/admin/vesti', saved.id]);
        }
      },
      error: (error) => {
        this.busy.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}
