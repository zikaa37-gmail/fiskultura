import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { API_URL } from '../../core/http/api';
import { Coverage, COVERAGE_LABELS } from './founding.model';

@Component({
  selector: 'app-founding-coverage',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .coverage-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .coverage-card {
      display: grid;
      gap: 6px;
      align-content: start;
      padding: 12px;
      border-radius: var(--radius);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      min-width: 0;
    }

    .coverage-card h3 {
      font-size: 15px;
      overflow-wrap: anywhere;
    }

    .coverage-none {
      background: var(--color-surface-alt);
    }

    .coverage-card .status {
      font-size: 11px;
    }

    .coverage-orgs {
      display: grid;
      gap: 2px;
    }

    @media (min-width: 600px) {
      .coverage-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media (min-width: 960px) {
      .coverage-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }
  `,
  template: `
    @if (coverage.value(); as data) {
      <p class="result-count mb-3">
        Društvo postoji u {{ covered() }} od {{ data.districts.length }} okruga, a aktivno je u {{ active() }}.
        @if (interested()) {
          U još {{ interested() }} okruga bez društva kolege su se prijavile da ga osnuju.
        }
      </p>
      <div class="coverage-grid">
        @for (item of data.districts; track item.district) {
          <article class="coverage-card" [class.coverage-none]="item.status === 'nema'">
            <h3>{{ item.district }}</h3>
            <span class="status" [class.status-next]="item.status === 'aktivno'">{{ labels[item.status] }}</span>
            @if (item.organizations.length) {
              <div class="coverage-orgs">
                @for (organization of item.organizations; track organization.slug) {
                  <a class="inline-link small" [routerLink]="['/udruzenja', organization.slug]">{{ organization.name }}</a>
                }
              </div>
            }
            @for (place of item.interest; track place.city) {
              <span class="small muted">{{ place.city }}: {{ place.people }} / {{ data.threshold }} kolege</span>
            }
          </article>
        }
      </div>
    } @else if (coverage.error()) {
      <p class="muted">Pokrivenost trenutno ne možemo da prikažemo.</p>
    } @else {
      <p class="muted">Učitavamo pokrivenost…</p>
    }
  `,
})
export class FoundingCoverage {
  protected readonly labels = COVERAGE_LABELS;
  protected readonly coverage = httpResource<Coverage>(() => ({ url: `${API_URL}/founding/coverage`, transferCache: false }));
  protected readonly covered = computed(() => this.coverage.value()?.districts.filter((item) => item.status !== 'nema').length ?? 0);
  protected readonly active = computed(() => this.coverage.value()?.districts.filter((item) => item.status === 'aktivno').length ?? 0);
  protected readonly interested = computed(
    () => this.coverage.value()?.districts.filter((item) => item.status === 'nema' && item.interest.length).length ?? 0,
  );
}
