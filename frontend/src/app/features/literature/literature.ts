import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { API_URL } from '../../core/http/api';
import { Regulation, REGULATION_KIND_LABELS } from '../../core/content/regulation.model';
import { Icon } from '../../shared/icon/icon';
import { LITERATURE_GROUPS, LiteratureGroup } from './literature-sources';

@Component({
  selector: 'app-literature',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Literatura i izvori</p>
          <h1>Odakle smo uzimali sadržaj</h1>
          <p class="muted">
            Pravila, uputstva i odgovori na portalu su naš sažetak prilagođen školskom času. Ovde su svi izvori na koje se oslanjamo, sa linkom na original:
            autorska prava pripadaju autorima i izdavačima, a u spornim situacijama važe zvanični tekstovi propisa i pravila.
          </p>
          <p class="muted small">Ukupno {{ total() }} izvora. Ako ste autor nekog materijala i želite da ga drugačije navedemo, pišite nam.</p>
        </div>

        <div class="page-sticky">
          <nav class="literature-index" aria-label="Oblasti">
            <a class="literature-index-link" routerLink="." fragment="propisi">Propisi</a>
            @for (group of groups; track group.id) {
              <a class="literature-index-link" routerLink="." [fragment]="group.id">{{ group.title }}</a>
            }
          </nav>
        </div>

        <section class="literature-group" id="propisi">
          <h2>Propisi</h2>
          <p class="muted small">Zakoni, pravilnici i programi na koje se pozivaju pitanja i odgovori i uputstva. Sažetak svakog propisa je na stranici <a class="inline-link" routerLink="/propisi">Propisi</a>.</p>
          <ul class="literature-list">
            @for (item of regulations(); track item.key) {
              <li>
                @if (item.url) {
                  <a class="literature-item" [href]="item.url" target="_blank" rel="noopener">
                    <app-icon name="external" [size]="18" />
                    <span class="literature-text"><strong>{{ item.title }}</strong><span class="muted small">{{ item.gazette ?? kindLabels[item.kind] }}</span></span>
                  </a>
                } @else {
                  <span class="literature-item">
                    <app-icon name="book" [size]="18" />
                    <span class="literature-text"><strong>{{ item.title }}</strong><span class="muted small">{{ item.gazette ?? kindLabels[item.kind] }}</span></span>
                  </span>
                }
              </li>
            }
          </ul>
        </section>

        @for (group of groups; track group.id) {
          <section class="literature-group" [id]="group.id">
            <h2>{{ group.title }}</h2>
            @if (group.page) {
              <p class="muted small">Korišćeno na stranici <a class="inline-link" [routerLink]="group.page">{{ group.title }}</a>.</p>
            }
            @if (group.note) {
              <p class="muted small">{{ group.note }}</p>
            }
            <ul class="literature-list">
              @for (item of group.items; track item.url) {
                <li>
                  <a class="literature-item" [href]="item.url" target="_blank" rel="noopener">
                    <app-icon [name]="item.badge.startsWith('PDF') ? 'pdf' : 'external'" [size]="18" />
                    <span class="literature-text">
                      <strong>{{ item.title }}</strong>
                      @if (item.note) {
                        <span class="muted small">{{ item.note }}</span>
                      }
                    </span>
                    <span class="post-category">{{ item.badge }}</span>
                  </a>
                </li>
              }
            </ul>
          </section>
        }
      </div>
    </section>
  `,
})
export class Literature {
  protected readonly groups: LiteratureGroup[] = LITERATURE_GROUPS.filter((group) => group.items.length);
  protected readonly kindLabels = REGULATION_KIND_LABELS;
  protected readonly resource = httpResource<Regulation[]>(() => `${API_URL}/regulations`);
  protected readonly regulations = computed(() => (this.resource.hasValue() ? this.resource.value() : []));
  protected readonly total = computed(() => this.regulations().length + this.groups.reduce((sum, group) => sum + group.items.length, 0));
}
