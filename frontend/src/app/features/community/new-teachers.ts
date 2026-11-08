import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate } from '../../core/content/content.model';
import { NEW_TEACHERS_CHECKED_AT, START_RULES, START_STEPS, startRuleUrl } from '../../content/new-teachers';
import { Icon } from '../../shared/icon/icon';
import { JoinCta } from '../../shared/join-cta/join-cta';

@Component({
  selector: 'app-new-teachers',
  imports: [RouterLink, Icon, JoinCta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Prvi koraci</p>
          <h1>Za nove nastavnike i studente</h1>
          <p class="muted">
            Završavaš fakultet sporta ili si tek počeo da radiš u školi? Ovde je ukratko šta važi za pripravnike i licencu i gde na portalu
            nalaziš sve što ti treba za čas.
          </p>
        </div>

        <section class="mb-5" aria-labelledby="start-rules">
          <h2 id="start-rules" class="mb-3">Šta važi kad počneš da radiš</h2>
          <ol class="start-rules">
            @for (rule of rules; track rule.title) {
              <li class="start-rule">
                <strong>{{ rule.title }}</strong>
                <span class="small">{{ rule.text }}</span>
                <a class="inline-link small" [href]="ruleUrl(rule.article)" target="_blank" rel="noopener">ZOSOV, član {{ rule.article }}</a>
              </li>
            }
          </ol>
          <p class="small muted">
            Provereno {{ checkedAt }} u Zakonu o osnovama sistema obrazovanja i vaspitanja. Izmene zakona su u pripremi, a šta se menja
            pratimo na stranici <a class="inline-link" routerLink="/propisi">Propisi</a>.
          </p>
        </section>

        <section class="mb-5" aria-labelledby="start-steps">
          <h2 id="start-steps" class="mb-3">Gde šta nalaziš</h2>
          <div class="rule-topic-grid">
            @for (step of steps; track step.title) {
              <a [class]="'rule-topic-card accent-' + step.accent" [routerLink]="step.link" [queryParams]="step.queryParams">
                <span class="tint-icon"><app-icon [name]="step.icon" [size]="18" /></span>
                <strong>{{ step.title }}</strong>
                <span class="small">{{ step.text }}</span>
              </a>
            }
          </div>
        </section>

        <app-join-cta
          title="Studenti i pripravnici, pridružite se"
          text="Nalog je besplatan. Dobijaš obaveštenja o seminarima i propisima, pitaš uredništvo kad nešto nije jasno i pronalaziš kolege u imeniku struke."
        />
      </div>
    </section>
  `,
})
export class NewTeachers {
  protected readonly rules = START_RULES;
  protected readonly steps = START_STEPS;
  protected readonly checkedAt = formatDate(NEW_TEACHERS_CHECKED_AT);

  protected ruleUrl(article: number): string {
    return startRuleUrl(article);
  }
}
