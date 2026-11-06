import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { API_URL } from '../../core/http/api';
import { formatDate } from '../../core/content/content.model';
import { normalizeRegulations, Regulation } from '../../core/content/regulation.model';
import { breadcrumbs, SeoService } from '../../core/seo/seo.service';
import { findRuleTopic } from '../../content/rules/rule-topics';
import { Icon } from '../../shared/icon/icon';
import { SimpleMarkdownPipe } from '../../shared/simple-markdown.pipe';

type TopicTab = 'vazi' | 'ranije' | 'kako-se-menjalo';

const TOPIC_TABS: { id: TopicTab; label: string }[] = [
  { id: 'vazi', label: 'Važi danas' },
  { id: 'ranije', label: 'Ranije' },
  { id: 'kako-se-menjalo', label: 'Kako se menjalo' },
];

@Component({
  selector: 'app-rule-topic-page',
  imports: [RouterLink, MatTabsModule, Icon, SimpleMarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container">
        <a class="inline-link outcomes-back" routerLink="/propisi">← Propisi</a>
        @if (topic(); as item) {
          <div class="section-head">
            <p class="eyebrow">Šta važi</p>
            <h1>{{ item.title }}</h1>
            <p class="small muted">
              Provereno {{ date(item.checkedAt) }} · {{ item.reviewedBy }}{{ item.aiAssisted ? ' · pripremljeno uz pomoć AI-ja iz zvaničnih tekstova' : '' }}
            </p>
          </div>

          <div class="page-sticky rules-tabs-wrap">
            <nav mat-tab-nav-bar [tabPanel]="panel" class="rules-tabs" mat-stretch-tabs="false" [disablePagination]="true" aria-label="Delovi teme">
              @for (option of tabs; track option.id) {
                <a mat-tab-link [routerLink]="[]" [queryParams]="{ tab: option.id === 'vazi' ? null : option.id }" [active]="activeTab() === option.id">{{ option.label }}</a>
              }
            </nav>
          </div>

          <mat-tab-nav-panel #panel>
            @switch (activeTab()) {
              @case ('vazi') {
                <div class="rule-now">
                  <p class="rule-now-label">Važi danas · {{ item.since }}</p>
                  <div class="markdown" [innerHTML]="item.now | simpleMarkdown"></div>
                  <p class="small">
                    Po propisima:
                    @for (key of item.regulations; track key; let last = $last) {
                      <a class="inline-link" [href]="url(key)" target="_blank" rel="noopener">{{ title(key) }}</a>{{ last ? '' : '; ' }}
                    }
                  </p>
                </div>

                @if (item.upcoming.length) {
                  <h2>Šta se menja</h2>
                  <ul class="rule-changes">
                    @for (change of item.upcoming; track $index) {
                      <li>
                        <span class="state-chip state-warn">od {{ change.from }}</span>
                        <div class="markdown" [innerHTML]="change.text | simpleMarkdown"></div>
                        <a class="inline-link small" [href]="url(change.regulation)" target="_blank" rel="noopener">{{ title(change.regulation) }} <app-icon name="external" [size]="14" /></a>
                      </li>
                    }
                  </ul>
                }

                @if (item.myths.length) {
                  <h2>Česte zablude</h2>
                  <div class="rule-myths">
                    @for (myth of item.myths; track $index) {
                      <div class="rule-myth">
                        <p class="rule-myth-wrong"><strong>Ne važi:</strong> {{ myth.myth }}</p>
                        <div class="markdown" [innerHTML]="myth.truth | simpleMarkdown"></div>
                      </div>
                    }
                  </div>
                }

                @if (item.links.length) {
                  <h2>Povezano na portalu</h2>
                  <ul class="rule-links">
                    @for (link of item.links; track link.route) {
                      <li><a class="inline-link" [routerLink]="link.route">{{ link.label }}</a></li>
                    }
                  </ul>
                }
              }
              @case ('ranije') {
                <p class="muted">Ovo više ne važi. Stoji ovde da bi se videlo šta je bilo pre i od kada je drugačije.</p>
                <div class="regulation-list">
                  @for (previous of item.previous; track $index) {
                    <article class="regulation regulation-expired">
                      <div class="regulation-head"><span class="state-chip state-muted">ne važi</span></div>
                      <h3>{{ previous.period }}</h3>
                      <div class="markdown" [innerHTML]="previous.text | simpleMarkdown"></div>
                      <a class="inline-link small" [href]="url(previous.regulation)" target="_blank" rel="noopener">{{ title(previous.regulation) }} <app-icon name="external" [size]="14" /></a>
                    </article>
                  }
                </div>
              }
              @case ('kako-se-menjalo') {
                <div class="markdown rules-intro" [innerHTML]="item.story | simpleMarkdown"></div>
                <h2>Vremenska linija</h2>
                <ol class="rule-timeline">
                  @for (step of item.timeline; track step.date) {
                    <li>
                      <span class="rules-era-period">{{ step.date }}</span>
                      <p>{{ step.text }}</p>
                      <p class="small muted">
                        @for (key of step.regulations; track key; let last = $last) {
                          <a class="inline-link" [href]="url(key)" target="_blank" rel="noopener">{{ title(key) }}</a>{{ last ? '' : '; ' }}
                        }
                      </p>
                    </li>
                  }
                </ol>
              }
            }
          </mat-tab-nav-panel>

          <p class="small muted rule-footnote">
            Sažetak pomaže da se snađete; obavezujući je zvanični tekst propisa. Vidite grešku ili zastarelu informaciju?
            <a class="inline-link" routerLink="/kontakt" [queryParams]="{ tema: 'greska' }">Javite uredništvu</a>.
          </p>
        } @else {
          <h1>Tema nije pronađena</h1>
          <p><a class="inline-link" routerLink="/propisi">Propisi</a></p>
        }
      </div>
    </section>
  `,
})
export class RuleTopicPage {
  readonly tema = input.required<string>();
  readonly tab = input<string>();

  readonly #seo = inject(SeoService);

  protected readonly tabs = TOPIC_TABS;
  protected readonly topic = computed(() => findRuleTopic(this.tema()));
  protected readonly activeTab = computed<TopicTab>(() => TOPIC_TABS.find((item) => item.id === this.tab())?.id ?? 'vazi');
  readonly #regulations = httpResource<Regulation[]>(() => `${API_URL}/regulations`, { parse: (value) => normalizeRegulations(value as Regulation[]) });
  readonly #byKey = computed(() => new Map((this.#regulations.hasValue() ? this.#regulations.value() : []).map((item) => [item.key, item])));

  constructor() {
    effect(() => {
      const topic = this.topic();
      const path = `/propisi/${this.tema()}`;
      if (!topic) {
        this.#seo.set({ title: 'Tema nije pronađena', path, noindex: true });
        return;
      }
      this.#seo.set({
        title: `${topic.title}: šta važi danas`,
        description: topic.card,
        path,
        jsonLd: breadcrumbs([
          { name: 'Propisi', path: '/propisi' },
          { name: topic.title, path },
        ]),
      });
    });
  }

  protected title(key: string): string {
    return this.#byKey().get(key)?.title ?? key;
  }

  protected url(key: string): string | null {
    return this.#byKey().get(key)?.url ?? null;
  }

  protected date(value: string): string {
    return formatDate(value);
  }
}
