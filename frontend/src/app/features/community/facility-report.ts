import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { AuthService } from '../../core/auth/auth.service';
import { formatDate } from '../../core/content/content.model';
import { DownloadService } from '../../core/download.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { FacilityCatalogStore } from './facility-catalog.store';
import { FacilityReportStore, ReportScope } from './facility-report.store';
import { openFacilityDialog } from './facility-dialog';
import { Institution } from './institution.model';
import { InstitutionStore } from './institution.store';

@Component({
  selector: 'app-facility-report',
  imports: [RouterLink, BUTTON_IMPORTS, FilterPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-filter-panel title="Izveštaj o infrastrukturi" [summary]="summary()">
      <div class="facility-report filter-panel-wide">
        @if (withData() === 0) {
          <p class="small muted">Za izabrane ustanove još nisu upisani podaci o sali, terenima, bazenu, stazi i rekvizitima.</p>
        } @else {
          <table class="facility-table">
            <tbody>
              @for (row of rows(); track row.flag) {
                <tr>
                  <th scope="row">{{ row.label }}</th>
                  @if (row.known) {
                    <td>{{ row.count }} <span class="muted">od {{ row.known }}</span></td>
                    <td class="muted">{{ row.share }}%</td>
                  } @else {
                    <td colspan="2" class="muted no-data">nema podataka</td>
                  }
                </tr>
              }
            </tbody>
          </table>
          <p class="small muted">Udeo je od škola za koje postoji taj podatak („od N”), ne od svih {{ items().length }}. „Nema podataka” znači da još niko nije upisao.</p>
        }

        @if (report().report?.summary; as ai) {
          <div class="facility-ai">
            <strong>{{ ai.title }}</strong>
            <p>{{ ai.summary }}</p>
            @if (ai.findings.length) {
              <ul>
                @for (line of ai.findings; track $index) {
                  <li>{{ line }}</li>
                }
              </ul>
            }
            @if (ai.recommendations.length) {
              <p class="small"><strong>Preporuke:</strong> {{ ai.recommendations.join(' ') }}</p>
            }
            <p class="small muted">AI izveštaj od {{ date(report().report?.created_at) }}{{ report().report?.author ? ', ' + report().report?.author : '' }}</p>
          </div>
        } @else if (report().loaded) {
          <p class="small muted">Za ovaj izbor još nema AI izveštaja.</p>
        }
        <div class="facility-cta">
          <strong>Radite u školi? Upišite šta ona ima.</strong>
          <span class="small">Sala, svlačionice, tereni, bazen, atletika i rekviziti. Bez ovih podataka ne možemo da pokažemo pravo stanje ni da tražimo ulaganja.</span>
          @if (!auth.isAuthenticated()) {
            <a mat-flat-button size="sm" routerLink="/prijava">Prijavite se</a>
          } @else if (mySchools().length) {
            <div class="facility-actions">
              @for (school of mySchools(); track school.institution_id) {
                <button type="button" mat-flat-button size="sm" (click)="openMine(school.institution_id!)">{{ school.name }}</button>
              }
            </div>
          } @else {
            <span class="small">Prvo <a routerLink="/profil">dodajte svoju školu u profil</a> (izaberite je sa spiska), pa ovde upišite podatke.</span>
          }
        </div>

        <div class="facility-actions">
          <button type="button" mat-stroked-button theme="tertiary" size="sm" [disabled]="downloading()" (click)="download()">Preuzmi PDF</button>
          @if (!report().loaded) {
            <button type="button" mat-stroked-button theme="tertiary" size="sm" (click)="loadAi()">Prikaži AI izveštaj</button>
          }
          @if (auth.isEditor()) {
            <button type="button" mat-flat-button size="sm" [disabled]="busy() || withData() === 0" (click)="generate()">
              {{ busy() ? 'AI piše izveštaj…' : 'Napravi AI izveštaj' }}
            </button>
          }
        </div>
      </div>
    </app-filter-panel>
  `,
  styles: `
    .facility-report {
      display: grid;
      gap: 12px;
    }
    .facility-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .facility-table th,
    .facility-table td {
      padding: 6px 4px;
      border-bottom: 1px solid var(--color-border);
      text-align: left;
      font-weight: 400;
    }
    .facility-table td {
      text-align: right;
      white-space: nowrap;
      min-width: 56px;
      font-variant-numeric: tabular-nums;
    }
    .facility-ai {
      padding: 12px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));
    }
    .facility-ai p,
    .facility-ai ul {
      margin: 6px 0 0;
    }
    .no-data {
      text-align: right;
      font-style: italic;
    }
    .facility-cta {
      display: grid;
      gap: 8px;
      padding: 12px;
      border-radius: 12px;
      border: 1px dashed var(--color-primary);
      background: var(--color-surface-alt);
    }
    .facility-cta a[mat-flat-button] {
      justify-self: start;
    }
    .facility-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
})
export class FacilityReportPanel {
  readonly items = input.required<Institution[]>();
  readonly scope = input.required<ReportScope>();

  protected readonly auth = inject(AuthService);
  readonly #catalog = inject(FacilityCatalogStore);
  readonly #reports = inject(FacilityReportStore);
  readonly #download = inject(DownloadService);
  readonly #notifications = inject(NotificationService);
  readonly #http = inject(HttpClient);
  readonly #dialog = inject(MatDialog);
  readonly #store = inject(InstitutionStore);

  protected readonly busy = signal(false);
  protected readonly downloading = signal(false);
  protected readonly report = computed(() => this.#reports.state(this.scope())());
  protected readonly withData = computed(() => this.items().filter((item) => item.facility_flags.includes('podaci')).length);
  protected readonly rows = computed(() => {
    const flags = this.#catalog.catalog()?.flags ?? {};
    return Object.entries(flags)
      .filter(([flag]) => flag !== 'podaci')
      .map(([flag, label]) => {
        const known = this.items().filter((item) => item.facility_known?.includes(flag));
        const count = known.filter((item) => item.facility_flags.includes(flag)).length;
        return { flag, label, known: known.length, count, share: known.length ? Math.round((count / known.length) * 100) : null };
      });
  });
  protected readonly mySchools = computed(() => (this.auth.currentUser()?.schools ?? []).filter((school) => school.institution_id !== null));
  protected readonly summary = computed(() => (this.withData() ? `${this.withData()} od ${this.items().length} sa podacima` : 'Nema podataka'));

  constructor() {
    this.#catalog.load();
  }

  protected loadAi(): void {
    this.#reports.loadLatest(this.scope());
  }

  protected generate(): void {
    this.busy.set(true);
    this.#reports.generate(this.scope()).subscribe({
      next: (report) => {
        this.busy.set(false);
        if (report.error) {
          this.#notifications.show(`Brojevi su sačuvani, ali AI tekst nije napravljen: ${report.error}`);
        }
      },
      error: (error) => {
        this.busy.set(false);
        this.#notifications.show(apiErrorMessage(error));
      },
    });
  }

  protected download(): void {
    this.downloading.set(true);
    const report = this.report().report;
    this.#download
      .file(`${API_URL}/institutions/report.pdf`, 'infrastruktura-fiskultura.pdf', { ...this.scope(), ...(report ? { report: report.id } : {}) })
      .subscribe({
        next: () => this.downloading.set(false),
        error: (error) => {
          this.downloading.set(false);
          this.#notifications.show(apiErrorMessage(error));
        },
      });
  }

  protected openMine(id: number): void {
    this.#http.get<Institution>(`${API_URL}/institutions/${id}`).subscribe({
      next: (item) =>
        openFacilityDialog(this.#dialog, item).subscribe((updated) => {
          if (updated) {
            this.#store.replace(updated);
          }
        }),
      error: (error) => this.#notifications.show(apiErrorMessage(error)),
    });
  }

  protected date(value: string | null | undefined): string {
    return value ? formatDate(value) : '';
  }
}
