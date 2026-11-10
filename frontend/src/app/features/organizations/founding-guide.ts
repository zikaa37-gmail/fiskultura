import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { EXPANSION_IMPORTS } from '../../../theme/ui/expansion';
import { formatDate } from '../../core/content/content.model';
import { AFTER_FOUNDING, FOUNDING_ACTS, FOUNDING_CHECKED_AT, FOUNDING_DOCUMENTS, FOUNDING_LINKS, FOUNDING_STEPS } from '../../content/founding-guide';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-founding-guide',
  imports: [RouterLink, BUTTON_IMPORTS, EXPANSION_IMPORTS, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .founding-summary {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 16px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: var(--color-surface);
      list-style: none;
    }
    .founding-summary li {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    .founding-summary app-icon {
      flex: none;
      margin-top: 2px;
      color: var(--color-primary);
    }
    .doc-format {
      padding: 1px 6px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      color: var(--color-muted);
    }
    .doc-head {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .founding-sources {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .founding-cta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  template: `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Strukovna društva</p>
          <h1>Kako osnovati društvo pedagoga fizičke kulture</h1>
          <p class="muted">
            Društvo u vašem gradu je udruženje građana koje se upisuje u registar APR-a. Posao nije velik: troje kolega, jedna skupština,
            nekoliko dokumenata po gotovom primeru i jedna prijava.
          </p>
        </div>

        <section class="mb-5" aria-labelledby="founding-short">
          <h2 id="founding-short" class="mb-3">Ukratko</h2>
          <ul class="founding-summary">
            <li><app-icon name="people" [size]="18" /><span>Najmanje <strong>tri osnivača</strong>, bar jedan sa prebivalištem u Srbiji.</span></li>
            <li><app-icon name="checklist" [size]="18" /><span>Osnivačka skupština usvaja <strong>osnivački akt i statut</strong> i bira zastupnika.</span></li>
            <li><app-icon name="clipboard" [size]="18" /><span>Prijava APR-u, naknada <strong>8.000 dinara</strong>, rešenje za <strong>pet radnih dana</strong>.</span></li>
            <li><app-icon name="check" [size]="18" /><span>Pečat <strong>nije obavezan</strong> od 2018. godine.</span></li>
            <li><app-icon name="chart" [size]="18" /><span>Svake godine do <strong>31. marta</strong> izveštaj APR-u, ili izjava o neaktivnosti.</span></li>
          </ul>
        </section>

        <section class="mb-5" aria-labelledby="founding-steps">
          <h2 id="founding-steps" class="mb-3">Korak po korak</h2>
          <ol class="start-rules">
            @for (step of steps; track step.title) {
              <li class="start-rule">
                <strong>{{ step.title }}</strong>
                <span class="small">{{ step.text }}</span>
                @if (step.ref; as ref) {
                  <a class="inline-link small" [href]="ref.url" target="_blank" rel="noopener">{{ ref.label }}</a>
                }
              </li>
            }
          </ol>
        </section>

        <section class="mb-5" aria-labelledby="founding-docs">
          <h2 id="founding-docs" class="mb-2">Dokumenta za preuzimanje</h2>
          <p class="small muted mb-3">
            Zvanični primeri i obrasci Agencije za privredne registre. Preuzmete ih, upišete podatke svog društva i predate APR-u.
          </p>
          <div class="rule-topic-grid">
            @for (doc of documents; track doc.url) {
              <a [class]="'rule-topic-card accent-' + doc.accent" [href]="doc.url" target="_blank" rel="noopener">
                <span class="doc-head">
                  <span class="tint-icon"><app-icon [name]="doc.icon" [size]="18" /></span>
                  <span class="doc-format">{{ doc.format }}</span>
                </span>
                <strong>{{ doc.title }}</strong>
                <span class="small">{{ doc.text }}</span>
              </a>
            }
          </div>
        </section>

        <section class="mb-5" aria-labelledby="founding-after">
          <h2 id="founding-after" class="mb-3">Posle upisa</h2>
          <ol class="start-rules">
            @for (step of after; track step.title) {
              <li class="start-rule">
                <strong>{{ step.title }}</strong>
                <span class="small">{{ step.text }}</span>
                @if (step.ref; as ref) {
                  <a class="inline-link small" [href]="ref.url" target="_blank" rel="noopener">{{ ref.label }}</a>
                }
              </li>
            }
          </ol>
        </section>

        <mat-expansion-panel class="mb-5">
          <mat-expansion-panel-header>
            <mat-panel-title>Propisi i izvori</mat-panel-title>
          </mat-expansion-panel-header>
          <ul class="founding-sources mb-3">
            @for (act of acts; track act.url) {
              <li>
                <a class="inline-link" [href]="act.url" target="_blank" rel="noopener">{{ act.title }}</a>
                <span class="small muted"> · {{ act.note }}</span>
              </li>
            }
          </ul>
          <ul class="founding-sources">
            @for (link of links; track link.url) {
              <li><a class="inline-link small" [href]="link.url" target="_blank" rel="noopener">{{ link.label }}</a></li>
            }
          </ul>
          <p class="small muted">Provereno {{ checkedAt }}. Naknade i obrasci se menjaju, pa pre uplate proverite iznos na sajtu APR-a.</p>
        </mat-expansion-panel>

        <div class="empty-state">
          <h3>Osnovali ste društvo?</h3>
          <p class="muted">Javite se savezu da se društvo učlani u SSPFVS, a uredništvu da ga dodamo na portal sa kontaktima i objavama.</p>
          <div class="founding-cta">
            <a mat-flat-button routerLink="/udruzenja/sspfvs">SSPFVS</a>
            <a mat-stroked-button theme="tertiary" routerLink="/kontakt">Javi uredništvu</a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class FoundingGuide {
  protected readonly steps = FOUNDING_STEPS;
  protected readonly after = AFTER_FOUNDING;
  protected readonly documents = FOUNDING_DOCUMENTS;
  protected readonly links = FOUNDING_LINKS;
  protected readonly acts = FOUNDING_ACTS;
  protected readonly checkedAt = formatDate(FOUNDING_CHECKED_AT);
}
