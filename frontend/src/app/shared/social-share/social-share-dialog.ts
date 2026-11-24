import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { AuthService } from '../../core/auth/auth.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { DialogShell } from '../dialog-shell/dialog-shell';
import { fileToJpeg, renderSocialCard, SocialKind } from './social-card';
import { SocialNetwork, SocialPost, SocialShareData, SocialState } from './social.model';

@Component({
  selector: 'app-social-share-dialog',
  imports: [FormsModule, RouterLink, MatDialogModule, MatCheckboxModule, MatInputModule, MatProgressBarModule, MatButtonToggleModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell title="Objavi na Instagram i Facebook" [closable]="!busy()">
      @if (state.isLoading()) {
        <mat-progress-bar mode="indeterminate" />
      } @else if (!anyConnected()) {
        <p>Instagram i Facebook stranica još nisu povezani sa portalom.</p>
        @if (auth.isAdmin()) {
          <a mat-flat-button routerLink="/admin/drustvene-mreze" mat-dialog-close>Poveži naloge</a>
        } @else {
          <p class="muted">Administrator ih povezuje na stranici Društvene mreže.</p>
        }
      } @else {
        @if (busy()) {
          <div class="share-busy" role="status" aria-live="polite">
            <mat-progress-bar mode="indeterminate" />
            <strong>{{ scheduled() ? 'Zakazujem objavu…' : 'Objavljujem na mreže…' }}</strong>
            <span class="small muted">Instagram prvo obradi sliku, ovo traje do pola minuta. Ne zatvarajte prozor.</span>
          </div>
        }
        <div class="share-layout" [class.share-dimmed]="busy()" [attr.inert]="busy() ? '' : null">
          <div class="share-preview">
            @if (image(); as src) {
              <img [src]="src" alt="Slika za objavu" [class.story]="kind() === 'story'" />
            } @else {
              <div class="share-placeholder" [class.story]="kind() === 'story'">Pravim sliku…</div>
            }
            <div class="share-image-actions">
              <input #picker type="file" accept="image/*" hidden (change)="upload($event)" />
              <button type="button" mat-stroked-button theme="tertiary" size="sm" (click)="picker.click()">Druga slika</button>
              @if (custom()) {
                <button type="button" mat-stroked-button theme="tertiary" size="sm" (click)="useLogo()">Logo i naslov</button>
              }
            </div>
          </div>

          <div class="share-form">
            <mat-button-toggle-group [value]="kind()" (change)="setKind($event.value)" aria-label="Vrsta objave">
              <mat-button-toggle value="post">Objava</mat-button-toggle>
              <mat-button-toggle value="story">Story</mat-button-toggle>
            </mat-button-toggle-group>

            @if (kind() === 'post') {
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Tekst objave</mat-label>
                <textarea matInput rows="9" maxlength="2200" [ngModel]="caption()" (ngModelChange)="caption.set($event)"></textarea>
                <mat-hint align="end">{{ caption().length }} / 2200</mat-hint>
              </mat-form-field>
              <p class="muted small">Na Instagramu link u tekstu nije klikabilan, na Facebooku jeste.</p>
            } @else {
              <p class="muted small">Story je samo slika i ide samo na Instagram.</p>
            }

            <div class="share-networks">
              <mat-checkbox [checked]="networks().includes('instagram')" [disabled]="!state.value()?.connected" (change)="toggle('instagram', $event.checked)">
                Instagram {{ state.value()?.username ? '@' + state.value()?.username : '(nije povezan)' }}
              </mat-checkbox>
              <mat-checkbox [checked]="networks().includes('facebook')" [disabled]="!state.value()?.facebook?.connected || kind() === 'story'" (change)="toggle('facebook', $event.checked)">
                Facebook {{ state.value()?.facebook?.username ?? '(nije povezana)' }}
              </mat-checkbox>
            </div>

            <mat-checkbox [checked]="scheduled()" (change)="scheduled.set($event.checked)">Zakaži za kasnije</mat-checkbox>
            @if (scheduled()) {
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Datum i vreme</mat-label>
                <input matInput type="datetime-local" [min]="minDate" [ngModel]="when()" (ngModelChange)="when.set($event)" />
              </mat-form-field>
            }

            @if (error(); as text) {
              <p class="form-error" role="alert">{{ text }}</p>
            }
          </div>
        </div>
      }
      <ng-container dialogActions>
        <button type="button" mat-stroked-button mat-dialog-close [disabled]="busy()">Odustani</button>
        @if (anyConnected()) {
          <button type="button" mat-flat-button [disabled]="!canSubmit()" (click)="submit()">
            {{ busy() ? 'Objavljujem…' : scheduled() ? 'Zakaži' : 'Objavi sada' }}
          </button>
        }
      </ng-container>
    </app-dialog-shell>
  `,
  styles: `
    .share-layout {
      display: grid;
      gap: 16px;
    }
    .share-busy {
      display: grid;
      gap: 8px;
      margin-bottom: 16px;
      padding: 16px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
    }
    .share-dimmed {
      opacity: 0.5;
      pointer-events: none;
    }
    .share-preview {
      display: grid;
      gap: 8px;
      justify-items: center;
    }
    .share-preview img,
    .share-placeholder {
      width: 100%;
      max-width: 280px;
      aspect-ratio: 4 / 5;
      border-radius: 12px;
      border: 1px solid var(--color-border);
      object-fit: cover;
    }
    .share-preview .story {
      aspect-ratio: 9 / 16;
      max-width: 220px;
    }
    .share-placeholder {
      display: grid;
      place-items: center;
      color: var(--color-muted);
    }
    .share-image-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .share-form {
      display: grid;
      gap: 12px;
      align-content: start;
    }
    .share-networks {
      display: grid;
    }
    mat-form-field {
      width: 100%;
    }
    @media (min-width: 760px) {
      .share-layout {
        grid-template-columns: 280px 1fr;
        align-items: start;
      }
    }
  `,
})
export class SocialShareDialog {
  readonly #http = inject(HttpClient);
  readonly #ref = inject(MatDialogRef<SocialShareDialog, SocialPost>);
  protected readonly auth = inject(AuthService);
  protected readonly data = inject<SocialShareData>(MAT_DIALOG_DATA);

  protected readonly state = httpResource<SocialState>(() => `${API_URL}/admin/instagram`);
  protected readonly anyConnected = computed(() => !!this.state.value()?.connected || !!this.state.value()?.facebook?.connected);

  protected readonly kind = signal<SocialKind>('post');
  protected readonly caption = signal(this.data.caption);
  protected readonly image = signal<string | null>(null);
  protected readonly custom = signal<File | null>(null);
  protected readonly networks = signal<SocialNetwork[]>([]);
  protected readonly scheduled = signal(false);
  protected readonly when = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly minDate = localInput(new Date(Date.now() + 10 * 60_000));

  protected readonly canSubmit = computed(() => !this.busy() && !!this.image() && this.networks().length > 0 && (!this.scheduled() || !!this.when()));

  constructor() {
    effect(() => {
      const state = this.state.value();
      if (state) {
        this.networks.set([...(state.connected ? ['instagram' as const] : []), ...(state.facebook?.connected ? ['facebook' as const] : [])]);
      }
    });
    this.#render();
  }

  protected setKind(kind: SocialKind): void {
    this.kind.set(kind);
    if (kind === 'story') {
      this.networks.update((list) => list.filter((network) => network === 'instagram'));
    }
    this.#render();
  }

  protected toggle(network: SocialNetwork, on: boolean): void {
    this.networks.update((list) => (on ? [...new Set([...list, network])] : list.filter((item) => item !== network)));
  }

  protected upload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) {
      this.custom.set(file);
      this.#render();
    }
  }

  protected useLogo(): void {
    this.custom.set(null);
    this.#render();
  }

  protected submit(): void {
    this.busy.set(true);
    this.#ref.disableClose = true;
    this.error.set(null);
    this.#http
      .post<SocialPost>(`${API_URL}/admin/instagram/posts`, {
        kind: this.kind(),
        caption: this.kind() === 'post' ? this.caption().trim() : null,
        image: this.image(),
        networks: this.networks(),
        scheduled_at: this.scheduled() && this.when() ? new Date(this.when()).toISOString() : null,
        source_type: this.data.sourceType ?? null,
        source_id: this.data.sourceId ?? null,
      })
      .subscribe({
        next: (post) => this.#ref.close(post),
        error: (error) => {
          this.busy.set(false);
          this.#ref.disableClose = false;
          this.error.set(apiErrorMessage(error));
        },
      });
  }

  #render(): void {
    this.image.set(null);
    const file = this.custom();
    const kind = this.kind();
    (file ? fileToJpeg(file, kind) : renderSocialCard(this.data.title, this.data.label ?? '', kind))
      .then((image) => this.image.set(image))
      .catch(() => this.error.set('Slika nije napravljena. Izaberite drugu sliku.'));
  }
}

function localInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
