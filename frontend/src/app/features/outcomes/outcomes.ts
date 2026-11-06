import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { changesNextYear, OUTCOME_GRADES } from '../../content/outcomes/outcomes';

@Component({
  selector: 'app-outcomes',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Program nastave i učenja</p>
          <h1>Ishodi fizičkog i zdravstvenog vaspitanja po razredima</h1>
          <p class="muted">
            Šta učenik treba da zna i ume na kraju svakog razreda, teme i sadržaji programa i fond časova, prema važećim pravilnicima. Uz svaki razred je link na
            zvanični tekst u Pravno-informacionom sistemu.
          </p>
        </div>

        <h2 class="outcomes-group-title">Osnovna škola</h2>
        <div class="outcomes-grid">
          @for (grade of primary; track grade.slug) {
            <a class="outcomes-card" [routerLink]="['/ishodi', grade.slug]">
              <strong>{{ grade.label }}</strong>
              <span class="muted small">{{ grade.funds['2026/27'] }}</span>
              @if (changes(grade)) {
                <span class="post-category">Promena od 2027/28.</span>
              }
            </a>
          }
        </div>

        <h2 class="outcomes-group-title">Srednja škola</h2>
        <div class="outcomes-grid">
          @for (grade of secondary; track grade.slug) {
            <a class="outcomes-card" [routerLink]="['/ishodi', grade.slug]">
              <strong>{{ grade.label }}</strong>
              <span class="muted small">{{ grade.funds['2026/27'] }}</span>
              @if (changes(grade)) {
                <span class="post-category">Promena od 2027/28.</span>
              }
            </a>
          }
        </div>

        <div class="outcomes-note">
          <p>
            <strong>Od školske 2027/28.</strong> primenjuju se novi programi za 1. i 5. razred osnovne škole i I razred gimnazije, a 5. i 6. razred dobijaju 3 časa nedeljno
            umesto 2 časa i obaveznih fizičkih aktivnosti („Prosvetni glasnik” 1/2026). U 7. i 8. razredu fond je već 3 časa nedeljno.
          </p>
          <p class="muted small">
            Programi za srednju školu su programi gimnazije. Srednje stručne škole imaju fond po planu obrazovnog profila. U prvom ciklusu nastavu po važećem pravilniku izvodi
            učitelj, a nastavnik fizičkog i zdravstvenog vaspitanja plivanje i rad sa učenicima sa zdravstvenim teškoćama.
          </p>
        </div>
      </div>
    </section>
  `,
})
export class Outcomes {
  protected readonly primary = OUTCOME_GRADES.filter((grade) => grade.level === 'os');
  protected readonly secondary = OUTCOME_GRADES.filter((grade) => grade.level === 'ss');
  protected readonly changes = changesNextYear;
}
