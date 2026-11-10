import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Clipboard } from '@angular/cdk/clipboard';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MEMBER_STATUS_LABELS, MemberStatus } from '../../core/auth/user.model';
import { API_URL } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { SITE_URL } from '../../core/seo/seo.service';
import { FACULTY_SOURCES } from '../../content/new-teachers';
import { MemberCount, MemberStats } from './admin.model';

interface CountRow {
  label: string;
  total: number;
}

@Component({
  selector: 'app-admin-members',
  imports: [BUTTON_IMPORTS, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (resource.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    @if (stats(); as data) {
      <div class="stat-grid mb-4">
        <div class="stat-tile"><strong>{{ data.total }}</strong><span class="small">članova</span></div>
        <div class="stat-tile"><strong>{{ data.new_7_days }}</strong><span class="small">novih za 7 dana</span></div>
        <div class="stat-tile"><strong>{{ data.new_30_days }}</strong><span class="small">novih za 30 dana</span></div>
        <div class="stat-tile"><strong>{{ data.active_30_days }}</strong><span class="small">aktivnih za 30 dana</span></div>
        <div class="stat-tile"><strong>{{ data.in_directory }}</strong><span class="small">u imeniku</span></div>
        <div class="stat-tile"><strong>{{ data.surveys_consent }}</strong><span class="small">za ankete</span></div>
        <div class="stat-tile"><strong>{{ data.unverified }}</strong><span class="small">nepotvrđen mejl</span></div>
      </div>

      <div class="member-breakdown mb-5">
        <section>
          <h3 class="mb-2">Po statusu</h3>
          <ul class="count-list">
            @for (row of byStatus(); track row.label) {
              <li><span>{{ row.label }}</span><strong>{{ row.total }}</strong></li>
            }
          </ul>
        </section>
        <section>
          <h3 class="mb-2">Po okrugu</h3>
          <ul class="count-list">
            @for (row of byDistrict(); track row.label) {
              <li><span>{{ row.label }}</span><strong>{{ row.total }}</strong></li>
            }
          </ul>
        </section>
        <section>
          <h3 class="mb-2">Odakle su došli</h3>
          <ul class="count-list">
            @for (row of bySource(); track row.label) {
              <li><span>{{ row.label }}</span><strong>{{ row.total }}</strong></li>
            }
          </ul>
        </section>
      </div>
    }

    <section>
      <h3 class="mb-2">Linkovi za kampanju na fakultetima</h3>
      <p class="small muted mb-3">
        Svaki link vodi na stranicu za nove nastavnike i pamti odakle je posetilac došao. Kad se registruje, vidi se ovde pod
        „Odakle su došli”. Za plakat napravi QR kod od linka.
      </p>
      <div class="admin-rows">
        @for (faculty of faculties; track faculty.id) {
          <div class="admin-row">
            <div class="admin-row-main">
              <strong>{{ faculty.name }}</strong>
              <span class="small muted">{{ campaignUrl(faculty.id) }}</span>
            </div>
            <div class="admin-row-actions">
              <button type="button" mat-flat-button theme="tertiary" (click)="copy(faculty.id)">Kopiraj link</button>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class AdminMembers {
  readonly #clipboard = inject(Clipboard);
  readonly #notifications = inject(NotificationService);

  protected readonly faculties = FACULTY_SOURCES;
  protected readonly resource = httpResource<MemberStats>(() => `${API_URL}/admin/members/stats`);
  protected readonly stats = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  protected readonly byStatus = computed(() => this.#rows(this.stats()?.by_status, (value) => MEMBER_STATUS_LABELS[value as MemberStatus] ?? value, 'bez statusa'));
  protected readonly byDistrict = computed(() => this.#rows(this.stats()?.by_district, (value) => value, 'bez okruga'));
  protected readonly bySource = computed(() =>
    this.#rows(this.stats()?.by_source, (value) => FACULTY_SOURCES.find((faculty) => faculty.id === value)?.name ?? value, 'direktno ili pretraga'),
  );

  protected campaignUrl(source: string): string {
    return `${SITE_URL}/novi-nastavnici?izvor=${source}`;
  }

  protected copy(source: string): void {
    this.#clipboard.copy(this.campaignUrl(source));
    this.#notifications.show('Link je kopiran.');
  }

  #rows(counts: MemberCount[] | undefined, label: (value: string) => string, empty: string): CountRow[] {
    return (counts ?? []).map((count) => ({ label: count.value ? label(count.value) : empty, total: count.total }));
  }
}
