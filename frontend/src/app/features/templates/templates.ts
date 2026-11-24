import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { DOCUMENT_TEMPLATES, TEMPLATES_VERSION } from '../../content/document-templates';
import { APP_LINKS } from '../../content/portal-content';
import { regulationTextUrl } from '../../core/content/regulation-links';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-templates',
  imports: [BUTTON_IMPORTS, RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Šabloni</p>
          <h1>Šabloni dokumenata</h1>
          <p class="muted">
            Obrasci koji se traže svake godine, u Wordu, da ih dopunite i prilagodite svojoj školi. Napomena na dnu
            svakog šablona kaže šta propis traži.
          </p>
        </div>
        <p class="muted mb-4">
          Godišnji i operativni plan sa već upisanim ishodima i vežbama pravi
          <a class="inline-link" [href]="ePripreme" target="_blank" rel="noopener">e-pripreme</a>. Nedostaje vam neki
          obrazac? <a class="inline-link" routerLink="/kontakt">Javite nam</a>.
        </p>
        <div class="module-grid">
          @for (item of templates; track item.id) {
            <article class="module" [class]="'accent-' + item.accent">
              <span class="module-icon"><app-icon [name]="item.icon" [size]="26" /></span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.summary }}</p>
              <span class="status">Word · {{ item.pages }} · {{ version }}</span>
              @if (item.references.length) {
                <p class="small">
                  Propis:
                  @for (reference of item.references; track reference.label; let last = $last) {
                    <a class="inline-link" [href]="referenceUrl(reference.url, reference.article)" target="_blank" rel="noopener">{{ reference.label }}{{ reference.article ? ', čl. ' + reference.article : '' }}</a>{{ last ? '' : '; ' }}
                  }
                </p>
              }
              @if (item.related; as related) {
                <a class="inline-link small" [routerLink]="related.route">{{ related.label }}</a>
              }
              <a mat-flat-button [href]="'/sabloni/' + item.file" download>
                <app-icon name="download" [size]="18" /> Preuzmi
              </a>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class Templates {
  protected readonly templates = DOCUMENT_TEMPLATES;
  protected readonly version = TEMPLATES_VERSION;
  protected readonly ePripreme = APP_LINKS.ePripreme;

  protected referenceUrl(url: string, article?: string): string {
    return regulationTextUrl(url, article ? `čl. ${article}` : '') ?? url;
  }
}
