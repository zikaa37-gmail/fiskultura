import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { AuthService } from '../../core/auth/auth.service';
import { formatDate } from '../../core/content/content.model';
import { DownloadService } from '../../core/download.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { DialogShell } from '../../shared/dialog-shell/dialog-shell';
import { Icon } from '../../shared/icon/icon';
import { FacilityCatalogStore } from './facility-catalog.store';
import { FacilityFormData, FacilityFormDialog, FacilityFormResult } from './facility-form-dialog';
import { describeFacilities, ORIGIN_LABELS } from './facility.model';
import { Institution } from './institution.model';
import { InstitutionStore } from './institution.store';

@Component({
  selector: 'app-facility-dialog',
  imports: [MatDialogModule, RouterLink, BUTTON_IMPORTS, DialogShell, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell [title]="'Infrastruktura: ' + item().name">
      <div class="facility-head mb-3">
        @if (item().pending_submissions > 0) {
          <span class="state-chip state-warn">Na proveri</span>
        }
        <button type="button" class="info-button" [attr.aria-expanded]="info()" aria-label="Šta znače oznake" title="Šta znače oznake" (click)="info.set(!info())">
          <app-icon name="help" [size]="20" />
        </button>
      </div>
      @if (info()) {
        <p class="small muted info-text mb-3">
          „Zvanično” su podaci Ministarstva prosvete, „Provereno” je upisao kolega iz škole i proverio urednik, „Na proveri” znači da predlog čeka urednika. Podatke upisuju
          kolege koje rade u školi (škola mora biti izabrana sa spiska u profilu), a urednik ih proverava pre objave.
        </p>
      }

      @if (groups().length) {
        <dl class="facility-facts mb-3">
          @for (group of groups(); track group.key) {
            <div>
              <dt>
                {{ group.label }}
                @if (origin(group.key); as label) {
                  <span class="state-chip" [class.state-ok]="label === 'Zvanično'" [class.state-muted]="label !== 'Zvanično'">{{ label }}</span>
                }
              </dt>
              <dd>{{ joined(group.items) }}</dd>
            </div>
          }
        </dl>
        @if (note()) {
          <p class="small mb-2">{{ note() }}</p>
        }
        <p class="small muted">Izvor: {{ item().facilities_source ?? 'portal' }}{{ item().facilities_updated_at ? ', ' + date(item().facilities_updated_at) : '' }}</p>
      } @else if (catalog()) {
        <p class="muted">Još nema podataka o infrastrukturi ove škole.</p>
      }
      @if (!canEdit()) {
        <p class="small muted mt-note">
          Podatke upisuju kolege koje rade u ovoj školi.
          @if (auth.isAuthenticated()) {
            Radite ovde? <a routerLink="/profil" mat-dialog-close>Dodajte školu u profil</a> (izaberite je sa spiska).
          } @else {
            Radite ovde? <a routerLink="/prijava" mat-dialog-close>Prijavite se</a> i dodajte školu u profil.
          }
        </p>
      }

      <div dialogActions>
        @if (canEdit()) {
          <button type="button" mat-flat-button (click)="edit()">Izmeni</button>
        }
        <button type="button" mat-stroked-button theme="tertiary" [disabled]="downloading()" (click)="download()">PDF</button>
        <button type="button" mat-button theme="tertiary" (click)="close()">Zatvori</button>
      </div>
    </app-dialog-shell>
  `,
  styles: `
    .facility-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .info-button {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--color-muted);
      cursor: pointer;
    }
    .info-button:hover,
    .info-button[aria-expanded='true'] {
      background: var(--color-surface-alt);
      color: var(--color-primary);
    }
    .mt-note {
      margin-top: 16px;
    }
    .info-text {
      padding: 8px 12px;
      border-radius: 8px;
      background: var(--color-surface-alt);
    }
    .facility-facts {
      display: grid;
      gap: 12px;
      margin: 0;
    }
    .facility-facts div {
      display: grid;
      gap: 2px;
    }
    .facility-facts dt {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      font-weight: 700;
    }
    .facility-facts dd {
      margin: 0;
      overflow-wrap: anywhere;
      white-space: pre-line;
    }
  `,
})
export class FacilityDialog {
  readonly #ref = inject(MatDialogRef<FacilityDialog, Institution>);
  protected readonly item = signal(inject<Institution>(MAT_DIALOG_DATA));
  protected readonly auth = inject(AuthService);
  readonly #catalogStore = inject(FacilityCatalogStore);
  readonly #store = inject(InstitutionStore);
  readonly #download = inject(DownloadService);
  readonly #dialog = inject(MatDialog);
  readonly #notifications = inject(NotificationService);
  protected readonly info = signal(false);
  protected readonly downloading = signal(false);
  protected readonly catalog = this.#catalogStore.catalog;
  protected readonly groups = computed(() => {
    const catalog = this.catalog();
    return catalog ? describeFacilities(catalog, this.item().facilities) : [];
  });
  protected readonly canEdit = computed(() => this.auth.isEditor() || (this.auth.currentUser()?.schools ?? []).some((school) => school.institution_id === this.item().id));
  protected readonly note = computed(() => (typeof this.item().facilities?.napomena === 'string' ? this.item().facilities.napomena : ''));

  constructor() {
    this.#catalogStore.load();
  }

  protected joined(items: { label: string; value: string }[]): string {
    return items.map((entry) => `${entry.label}: ${entry.value}`).join('\n');
  }

  protected date(value: string | null): string {
    return value ? formatDate(value) : '';
  }

  protected origin(group: string): string | null {
    const origin = this.item().facilities_origin?.[group];
    return origin ? (ORIGIN_LABELS[origin] ?? null) : null;
  }

  protected close(): void {
    this.#ref.close(this.item());
  }

  protected download(): void {
    this.downloading.set(true);
    this.#download.file(`${API_URL}/institutions/${this.item().id}/pdf`, `${this.item().name}.pdf`).subscribe({
      next: () => this.downloading.set(false),
      error: (error) => {
        this.downloading.set(false);
        this.#notifications.show(apiErrorMessage(error));
      },
    });
  }

  protected edit(): void {
    const catalog = this.catalog();
    if (!catalog) return;
    const mode = this.auth.isEditor() ? 'edit' : 'submit';
    this.#dialog
      .open<FacilityFormDialog, FacilityFormData, FacilityFormResult>(FacilityFormDialog, {
        data: { institution: this.item(), catalog, mode },
        width: '720px',
        maxWidth: '100vw',
        panelClass: 'app-dialog-panel',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        const updated = 'saved' in result ? result.saved : { ...this.item(), pending_submissions: this.item().pending_submissions + 1 };
        this.item.set(updated);
        this.#store.replace(updated);
        this.#notifications.show('saved' in result ? 'Infrastruktura je sačuvana.' : result.submitted);
      });
  }
}

export function openFacilityDialog(dialog: MatDialog, item: Institution) {
  return dialog
    .open<FacilityDialog, Institution, Institution>(FacilityDialog, { data: item, width: '640px', maxWidth: '100vw', panelClass: ['app-dialog-panel', 'news-dialog-panel'], autoFocus: false })
    .afterClosed();
}
