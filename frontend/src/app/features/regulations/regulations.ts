import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { API_URL } from '../../core/http/api';
import { formatDate } from '../../core/content/content.model';
import {
  Regulation,
  REGULATION_AREA_LABELS,
  REGULATION_KIND_LABELS,
  RegulationArea,
  RegulationKind,
  VERIFICATION_LABELS,
} from '../../core/content/regulation.model';
import { Icon } from '../../shared/icon/icon';
import { SimpleMarkdownPipe } from '../../shared/simple-markdown.pipe';
import { RegulationHistoryService } from './regulation-history';

@Component({
  selector: 'app-regulations',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatSelectModule, Icon, SimpleMarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './regulations.html',
})
export class Regulations {
  readonly oblast = input<string>();
  readonly vrsta = input<string>();
  readonly pretraga = input<string>();

  readonly #router = inject(Router);
  readonly #history = inject(RegulationHistoryService);

  protected readonly areaLabels = REGULATION_AREA_LABELS;
  protected readonly areas = Object.keys(REGULATION_AREA_LABELS) as RegulationArea[];
  protected readonly kindLabels = REGULATION_KIND_LABELS;
  protected readonly kinds = Object.keys(REGULATION_KIND_LABELS) as RegulationKind[];
  protected readonly verificationLabels = VERIFICATION_LABELS;

  protected readonly area = computed(() => (this.areas.includes(this.oblast() as RegulationArea) ? (this.oblast() as RegulationArea) : null));
  protected readonly kind = computed(() => (this.kinds.includes(this.vrsta() as RegulationKind) ? (this.vrsta() as RegulationKind) : null));
  protected readonly searchText = linkedSignal(() => this.pretraga() ?? '');

  readonly #resource = httpResource<Regulation[]>(() => {
    const params = new URLSearchParams();
    if (this.area()) params.set('area', this.area()!);
    if (this.kind()) params.set('kind', this.kind()!);
    if (this.pretraga()) params.set('q', this.pretraga()!);
    const query = params.toString();
    return `${API_URL}/regulations${query ? `?${query}` : ''}`;
  });

  readonly #lastList = linkedSignal<Regulation[] | undefined, Regulation[] | null>({
    source: () => (this.#resource.hasValue() ? this.#resource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });
  protected readonly items = computed(() => this.#lastList() ?? []);
  protected readonly isLoading = this.#resource.isLoading;
  protected readonly hasError = computed(() => !!this.#resource.error());
  protected readonly hasFilters = computed(() => !!this.area() || !!this.kind() || !!this.pretraga());

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
    this.#router.navigate([], { queryParams: {} });
  }

  protected showHistory(item: Regulation): void {
    this.#history.open(item.key, item.title);
  }

  protected date(value: string | null): string {
    return formatDate(value);
  }

  #navigate(queryParams: Record<string, string | null>): void {
    this.#router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}
