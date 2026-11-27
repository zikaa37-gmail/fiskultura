import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { formatDate } from '../../core/content/content.model';
import {
  CONTACTS_CHECKED_AT,
  INSTITUTION_CONTACTS,
  InstitutionContact,
  SCHOOL_ADMINISTRATIONS,
  SchoolAdministration,
} from '../../content/rules/contacts';
import { ContactDialogService } from '../regulations/contact-dialog';
import {
  CONTACT_GUIDES,
  ContactGuide,
  LOCAL_INSPECTIONS,
  LOCAL_INSPECTIONS_NOTE,
  LOCAL_INSPECTIONS_URL,
} from '../../content/rules/contact-guides';
import {
  COMPETITION_LEVELS,
  COMPETITION_NOTE,
  COMPETITION_SOURCE,
  SCHOOL_SPORT_CONTACTS,
} from '../../content/rules/school-sport';
import { Icon } from '../../shared/icon/icon';
import { ContactGuideDialogService } from './contact-guide-dialog';
import { DirectoryTabs } from './directory-tabs';

@Component({
  selector: 'app-public-institutions',
  styles: `
    .competition-steps {
      display: grid;
      gap: 6px;
      margin-top: 0;
      padding-left: 22px;
    }
  `,
  imports: [Icon, DirectoryTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section section-compact">
      <div class="container">
        <h1 class="page-title mb-3">Imenik</h1>
        <app-directory-tabs active="institucije">
          <h2 class="mb-2">Kome da se obratim?</h2>
          <p class="muted small mb-3">
            Kratko: kada se obraća kojoj službi, kojim redom i šta da napišete. Prvo uvek pisano
            školi.
          </p>
          <div class="contact-grid mb-5">
            @for (guide of guides; track guide.id) {
              <button
                type="button"
                [class]="'contact-card accent-' + guide.accent"
                (click)="openGuide(guide)"
              >
                <span class="contact-card-head">
                  <span class="tint-icon"><app-icon [name]="guide.icon" [size]="18" /></span>
                  <strong>{{ guide.title }}</strong>
                </span>
                <span class="small">{{ guide.short }}</span>
              </button>
            }
          </div>
          <h2 class="mb-2">Ministarstva, zavodi i inspekcije</h2>
          <p class="muted small mb-3">
            Dodirnite karticu za telefone i mejlove. Provereno {{ checkedAt }}
          </p>
          <div class="contact-grid mb-5">
            @for (institution of contacts; track institution.id) {
              <button
                type="button"
                [class]="'contact-card accent-' + institution.accent"
                (click)="openInstitution(institution)"
              >
                <span class="contact-card-head">
                  <span class="tint-icon"><app-icon [name]="institution.icon" [size]="18" /></span>
                  <strong>{{ institution.name }}</strong>
                </span>
                <span class="small">{{ institution.when }}</span>
              </button>
            }
          </div>
          <h2 class="mb-2">Školske uprave</h2>
          <p class="muted small mb-3">
            Prvo mesto za pitanja o radu škole, stručno-pedagoški nadzor i pritužbe na nivou okruga.
          </p>
          <div class="contact-cities mb-5">
            @for (office of administrations; track office.city) {
              <button type="button" class="contact-city" (click)="openAdministration(office)">
                <app-icon name="pin" [size]="16" /> {{ office.city }}
              </button>
            }
          </div>
          <h2 class="mb-2">Školski sport</h2>
          <p class="muted small mb-3">
            Takmičenja idu stepenasto, a na sledeći nivo ide pobednik prethodnog.
            <a [href]="competitionSource" target="_blank" rel="noopener"
              >Pravilnik o takmičenjima</a
            >
          </p>
          <ol class="competition-steps mb-3">
            @for (step of levels; track step.level) {
              <li>
                <strong>{{ step.level }}</strong> - <span class="small muted">{{ step.text }}</span>
              </li>
            }
          </ol>
          <p class="small mb-3">{{ competitionNote }}</p>
          <div class="contact-grid mb-5">
            @for (institution of sport; track institution.id) {
              <button
                type="button"
                [class]="'contact-card accent-' + institution.accent"
                (click)="openInstitution(institution)"
              >
                <span class="contact-card-head">
                  <span class="tint-icon"><app-icon [name]="institution.icon" [size]="18" /></span>
                  <strong>{{ institution.name }}</strong>
                </span>
                <span class="small">{{ institution.when }}</span>
              </button>
            }
          </div>
          <h2 class="mb-2">Prosvetna inspekcija u opštinama i gradovima</h2>
          <p class="muted small mb-3">
            {{ localNote }}
            <a [href]="localUrl" target="_blank" rel="noopener">Spisak opština sa inspektorom</a>
          </p>
          <div class="contact-grid">
            @for (institution of inspections; track institution.id) {
              <button
                type="button"
                [class]="'contact-card accent-' + institution.accent"
                (click)="openInstitution(institution)"
              >
                <span class="contact-card-head">
                  <span class="tint-icon"><app-icon [name]="institution.icon" [size]="18" /></span>
                  <strong>{{ institution.name }}</strong>
                </span>
                <span class="small">{{ institution.when }}</span>
              </button>
            }
          </div>
        </app-directory-tabs>
      </div>
    </section>
  `,
})
export class PublicInstitutions {
  readonly #contacts = inject(ContactDialogService);
  readonly #guides = inject(ContactGuideDialogService);
  protected readonly guides = CONTACT_GUIDES;
  protected readonly sport = SCHOOL_SPORT_CONTACTS;
  protected readonly levels = COMPETITION_LEVELS;
  protected readonly competitionNote = COMPETITION_NOTE;
  protected readonly competitionSource = COMPETITION_SOURCE;
  protected readonly inspections = LOCAL_INSPECTIONS;
  protected readonly localNote = LOCAL_INSPECTIONS_NOTE;
  protected readonly localUrl = LOCAL_INSPECTIONS_URL;

  protected readonly contacts = INSTITUTION_CONTACTS;
  protected readonly administrations = SCHOOL_ADMINISTRATIONS;
  protected readonly checkedAt = formatDate(CONTACTS_CHECKED_AT);

  protected openInstitution(item: InstitutionContact): void {
    this.#contacts.openInstitution(item);
  }

  protected openGuide(guide: ContactGuide): void {
    this.#guides.open(guide);
  }

  protected openAdministration(item: SchoolAdministration): void {
    this.#contacts.openAdministration(item);
  }
}
