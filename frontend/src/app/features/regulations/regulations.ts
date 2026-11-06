import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { API_URL } from '../../core/http/api';
import { formatDate } from '../../core/content/content.model';
import {
  normalizeRegulations,
  Regulation,
  REGULATION_AREA_LABELS,
  REGULATION_KIND_LABELS,
  REGULATION_STATUS_LABELS,
  RegulationArea,
  RegulationKind,
  VERIFICATION_LABELS,
} from '../../core/content/regulation.model';
import {
  CONTACTS_CHECKED_AT,
  INSTITUTION_CONTACTS,
  InstitutionContact,
  SCHOOL_ADMINISTRATIONS,
  SchoolAdministration,
} from '../../content/rules/contacts';
import { RULE_HISTORY, RULE_HISTORY_INTRO, RULE_UPCOMING } from '../../content/rules/rule-history';
import { linkArticles, regulationTextUrl } from '../../core/content/regulation-links';
import { RULE_TOPICS } from '../../content/rules/rule-topics';
import { Icon } from '../../shared/icon/icon';
import { SimpleMarkdownPipe } from '../../shared/simple-markdown.pipe';
import { RegulationHistoryService } from './regulation-history';
import { ContactDialogService } from './contact-dialog';

export type RegulationsTab = 'vazece' | 'ranije' | 'kako-se-menjalo' | 'kontakti';

export const REGULATIONS_TABS: { id: RegulationsTab; label: string }[] = [
  { id: 'vazece', label: 'Važeće' },
  { id: 'ranije', label: 'Ranije' },
  { id: 'kako-se-menjalo', label: 'Kako se menjalo' },
  { id: 'kontakti', label: 'Kontakti' },
];

@Component({
  selector: 'app-regulations',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTabsModule,
    Icon,
    SimpleMarkdownPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './regulations.html',
})
export class Regulations {
  readonly tab = input<string>();
  readonly oblast = input<string>();
  readonly vrsta = input<string>();
  readonly pretraga = input<string>();

  readonly #router = inject(Router);
  readonly #history = inject(RegulationHistoryService);
  readonly #contacts = inject(ContactDialogService);

  protected readonly tabs = REGULATIONS_TABS;
  protected readonly topics = RULE_TOPICS;
  protected readonly historyIntro = RULE_HISTORY_INTRO;
  protected readonly eras = RULE_HISTORY;
  protected readonly upcoming = RULE_UPCOMING;
  protected readonly open = signal<ReadonlySet<number>>(new Set());
  readonly #markdown = new SimpleMarkdownPipe();
  protected readonly contacts = INSTITUTION_CONTACTS;
  protected readonly administrations = SCHOOL_ADMINISTRATIONS;
  protected readonly contactsCheckedAt = CONTACTS_CHECKED_AT;
  protected readonly areaLabels = REGULATION_AREA_LABELS;
  protected readonly areas = Object.keys(REGULATION_AREA_LABELS) as RegulationArea[];
  protected readonly kindLabels = REGULATION_KIND_LABELS;
  protected readonly kinds = Object.keys(REGULATION_KIND_LABELS) as RegulationKind[];
  protected readonly statusLabels = REGULATION_STATUS_LABELS;
  protected readonly verificationLabels = VERIFICATION_LABELS;

  protected readonly activeTab = computed<RegulationsTab>(
    () => REGULATIONS_TABS.find((item) => item.id === this.tab())?.id ?? 'vazece',
  );
  protected readonly area = computed(() =>
    this.areas.includes(this.oblast() as RegulationArea) ? (this.oblast() as RegulationArea) : null,
  );
  protected readonly kind = computed(() =>
    this.kinds.includes(this.vrsta() as RegulationKind) ? (this.vrsta() as RegulationKind) : null,
  );
  protected readonly searchText = linkedSignal(() => this.pretraga() ?? '');

  readonly #resource = httpResource<Regulation[]>(
    () => {
      const params = new URLSearchParams();
      if (this.area()) params.set('area', this.area()!);
      if (this.kind()) params.set('kind', this.kind()!);
      if (this.pretraga()) params.set('q', this.pretraga()!);
      const query = params.toString();
      return `${API_URL}/regulations${query ? `?${query}` : ''}`;
    },
    { parse: (value) => normalizeRegulations(value as Regulation[]) },
  );
  readonly #all = httpResource<Regulation[]>(() => `${API_URL}/regulations`, {
    parse: (value) => normalizeRegulations(value as Regulation[]),
  });

  readonly #lastList = linkedSignal<Regulation[] | undefined, Regulation[] | null>({
    source: () => (this.#resource.hasValue() ? this.#resource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });
  protected readonly items = computed(() => this.#lastList() ?? []);
  protected readonly current = computed(() =>
    this.items().filter((item) => item.status !== 'prestao'),
  );
  protected readonly expired = computed(() =>
    this.items()
      .filter((item) => item.status === 'prestao')
      .sort((a, b) => (b.valid_to ?? '').localeCompare(a.valid_to ?? '')),
  );
  protected readonly showsList = computed(
    () => this.activeTab() === 'vazece' || this.activeTab() === 'ranije',
  );
  protected readonly shown = computed(() =>
    this.activeTab() === 'ranije' ? this.expired() : this.current(),
  );
  protected readonly byKey = computed(
    () => new Map((this.#all.hasValue() ? this.#all.value() : []).map((item) => [item.key, item])),
  );
  protected readonly coming = computed(() =>
    (this.#all.hasValue() ? this.#all.value() : [])
      .filter((item) => item.status === 'najava' || item.status === 'nacrt')
      .sort((a, b) => (a.valid_from ?? '9999').localeCompare(b.valid_from ?? '9999')),
  );
  protected readonly isLoading = this.#resource.isLoading;
  protected readonly hasError = computed(() => !!this.#resource.error());
  protected readonly hasFilters = computed(
    () => !!this.area() || !!this.kind() || !!this.pretraga(),
  );

  protected setArea(area: RegulationArea | null): void {
    this.#navigate({ oblast: area === this.area() ? null : area });
  }

  protected setKind(kind: RegulationKind | null): void {
    this.#navigate({ vrsta: kind });
  }

  protected search(): void {
    this.#navigate({ pretraga: this.searchText().trim() || null });
  }

  protected clearFilters(): void {
    this.searchText.set('');
    this.#router.navigate([], { queryParams: { tab: this.tab() ?? null } });
  }

  protected showHistory(item: Regulation): void {
    this.#history.open(item.key, item.title);
  }

  protected title(key: string): string {
    return this.byKey().get(key)?.title ?? key;
  }

  protected openInstitution(item: InstitutionContact): void {
    this.#contacts.openInstitution(item);
  }

  protected openAdministration(item: SchoolAdministration): void {
    this.#contacts.openAdministration(item);
  }

  protected toggle(id: number): void {
    this.open.update((current) => {
      const next = new Set(current);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });
  }

  protected textUrl(item: Regulation): string | null {
    return regulationTextUrl(item.url, item.summary);
  }

  protected summaryHtml(item: Regulation): string {
    return linkArticles(this.#markdown.transform(item.summary), item.url);
  }

  protected topicTitle(slug: string): string {
    return RULE_TOPICS.find((topic) => topic.slug === slug)?.title ?? slug;
  }

  protected date(value: string | null): string {
    return formatDate(value);
  }

  #navigate(queryParams: Record<string, string | null>): void {
    this.#router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}
