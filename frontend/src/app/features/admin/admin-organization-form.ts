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
import { LinkField, ORGANIZATION_LEVEL_LABELS, ORGANIZATION_TYPE_LABELS, OrganizationLevel, OrganizationType, organizationLabel } from '../../core/content/content.model';
import { AdminOrganization } from './admin.model';

type OrganizationStatus = AdminOrganization['status'];

@Component({
  selector: 'app-admin-organization-form',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="inline-link small" routerLink="/admin/udruzenja">← Sva udruženja</a>
    @if (isEdit() && resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <form class="admin-form" [formGroup]="form" (ngSubmit)="save()">
      <div class="admin-form-head">
        <h2>{{ isEdit() ? 'Izmena organizacije' : 'Nova organizacija' }}</h2>
        @if (loaded(); as item) {
          <a class="inline-link small" [routerLink]="['/udruzenja', item.slug]" target="_blank">Pogledaj na sajtu →</a>
        }
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Pun naziv</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>
      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Skraćenica</mat-label>
          <input matInput formControlName="short_name" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Grad / sedište</mat-label>
          <input matInput formControlName="city" />
        </mat-form-field>
      </div>
      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Tip</mat-label>
          <mat-select formControlName="type">
            @for (option of types; track option) {
              <mat-option [value]="option">{{ typeLabels[option] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Nivo</mat-label>
          <mat-select formControlName="level">
            @for (option of levels; track option) {
              <mat-option [value]="option">{{ levelLabels[option] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Krovna organizacija</mat-label>
          <mat-select formControlName="parent_id">
            <mat-option [value]="null">— nema —</mat-option>
            @for (item of parents(); track item.id) {
              <mat-option [value]="item.id">{{ label(item) }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="aktivno">Aktivno</mat-option>
            <mat-option value="neaktivno">Neaktivno</mat-option>
            <mat-option value="nepoznato">Nepoznato</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Opis</mat-label>
        <textarea matInput formControlName="description" rows="3"></textarea>
      </mat-form-field>

      <fieldset class="admin-fieldset">
        <legend>Kontakt i mreže</legend>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Sajt</mat-label>
            <input matInput formControlName="website" type="url" placeholder="https://..." />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Mejl</mat-label>
            <input matInput formControlName="email" type="email" />
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline">
          <mat-label>Facebook</mat-label>
          <input matInput formControlName="facebook" type="url" />
        </mat-form-field>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Instagram</mat-label>
            <input matInput formControlName="instagram" type="url" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>YouTube</mat-label>
            <input matInput formControlName="youtube" type="url" />
          </mat-form-field>
        </div>
        <div class="broken-links">
          <strong>Link ne radi (na sajtu će biti posivljen)</strong>
          @for (field of linkFields; track field.key) {
            <mat-checkbox [formControlName]="'broken_' + field.key">
              {{ field.label }}
              @if (statusLabel(field.key); as status) {
                <span class="muted small">· provera: {{ status }}</span>
              }
            </mat-checkbox>
          }
          <span class="muted small">Facebook i Instagram server ne može sam da proveri — označite ručno ako stranica ne postoji.</span>
        </div>
      </fieldset>

      <fieldset class="admin-fieldset">
        <legend>Evidencija</legend>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Poslednja uočena aktivnost</mat-label>
            <input matInput formControlName="last_activity" type="date" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Izvor podatka o članstvu</mat-label>
            <input matInput formControlName="member_source" type="url" />
          </mat-form-field>
        </div>
        <mat-form-field subscriptSizing="dynamic" appearance="outline">
          <mat-label>Adresa (slug, nije obavezno)</mat-label>
          <input matInput formControlName="slug" />
          <mat-hint>Pravi se iz skraćenice ili naziva.</mat-hint>
        </mat-form-field>
      </fieldset>

      @if (error(); as message) {
        <p class="form-error" role="alert">{{ message }}</p>
      }
      <div class="admin-form-actions">
        <button type="submit" mat-flat-button [disabled]="busy()">Sačuvaj</button>
        <a mat-button routerLink="/admin/udruzenja">Otkaži</a>
      </div>
    </form>
  `,
})
export class AdminOrganizationForm {
  readonly id = input<string>();

  readonly #http = inject(HttpClient);
  readonly #router = inject(Router);
  readonly #notifications = inject(NotificationService);

  protected readonly typeLabels = ORGANIZATION_TYPE_LABELS;
  protected readonly types = Object.keys(ORGANIZATION_TYPE_LABELS) as OrganizationType[];
  protected readonly levelLabels = ORGANIZATION_LEVEL_LABELS;
  protected readonly levels = Object.keys(ORGANIZATION_LEVEL_LABELS) as OrganizationLevel[];
  protected readonly label = organizationLabel;
  protected readonly linkFields: { key: Exclude<LinkField, 'member_source'>; label: string }[] = [
    { key: 'website', label: 'Sajt' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'youtube', label: 'YouTube' },
  ];

  protected readonly isEdit = computed(() => !!this.id());
  protected readonly resource = httpResource<AdminOrganization>(() => (this.id() ? `${API_URL}/admin/organizations/${this.id()}` : undefined));
  protected readonly loaded = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  readonly #allResource = httpResource<AdminOrganization[]>(() => `${API_URL}/admin/organizations`);
  protected readonly parents = computed(() =>
    (this.#allResource.hasValue() ? this.#allResource.value() : [])
      .filter((item) => String(item.id) !== this.id())
      .sort((a, b) => this.label(a).localeCompare(this.label(b), 'sr')),
  );

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', Validators.required],
    short_name: [''],
    city: [''],
    type: ['strukovno-udruzenje' as OrganizationType, Validators.required],
    level: ['gradski' as OrganizationLevel, Validators.required],
    parent_id: [null as number | null],
    status: ['nepoznato' as OrganizationStatus, Validators.required],
    description: [''],
    website: [''],
    email: [''],
    facebook: [''],
    instagram: [''],
    youtube: [''],
    last_activity: [''],
    member_source: [''],
    slug: [''],
    broken_website: [false],
    broken_facebook: [false],
    broken_instagram: [false],
    broken_youtube: [false],
  });

  protected statusLabel(field: LinkField): string | null {
    const item = this.loaded();
    const status = item?.link_status[field];
    if (!item || !status || item.broken_links.includes(field)) {
      return null;
    }
    return { ok: 'radi', broken: 'ne radi', unknown: 'nije moguće proveriti' }[status];
  }

  constructor() {
    effect(() => {
      const item = this.loaded();
      if (item) {
        this.form.reset({
          name: item.name,
          short_name: item.short_name ?? '',
          city: item.city ?? '',
          type: item.type,
          level: item.level,
          parent_id: item.parent_id,
          status: item.status,
          description: item.description ?? '',
          website: item.website ?? '',
          email: item.email ?? '',
          facebook: item.social.facebook ?? '',
          instagram: item.social.instagram ?? '',
          youtube: item.social.youtube ?? '',
          last_activity: item.last_activity ?? '',
          member_source: item.member_source ?? '',
          slug: item.slug,
          broken_website: item.broken_links.includes('website'),
          broken_facebook: item.broken_links.includes('facebook'),
          broken_instagram: item.broken_links.includes('instagram'),
          broken_youtube: item.broken_links.includes('youtube'),
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
    const payload = {
      name: value.name,
      short_name: nullable(value.short_name),
      city: nullable(value.city),
      type: value.type,
      level: value.level,
      parent_id: value.parent_id,
      status: value.status,
      description: nullable(value.description),
      website: nullable(value.website),
      email: nullable(value.email),
      social: { facebook: nullable(value.facebook), instagram: nullable(value.instagram), youtube: nullable(value.youtube) },
      last_activity: nullable(value.last_activity),
      member_source: nullable(value.member_source),
      slug: nullable(value.slug),
      broken_links: this.linkFields.filter((field) => value[`broken_${field.key}`]).map((field) => field.key),
    };
    const request = this.id()
      ? this.#http.patch<AdminOrganization>(`${API_URL}/admin/organizations/${this.id()}`, payload)
      : this.#http.post<AdminOrganization>(`${API_URL}/admin/organizations`, payload);

    this.busy.set(true);
    this.error.set(null);
    request.subscribe({
      next: (saved) => {
        this.busy.set(false);
        this.#notifications.show('Organizacija je sačuvana.');
        if (this.id()) {
          this.resource.set(saved);
        } else {
          this.#router.navigate(['/admin/udruzenja', saved.id]);
        }
      },
      error: (error) => {
        this.busy.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}
