import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Organization, OrganizationLevel, ORGANIZATION_LEVEL_LABELS, ORGANIZATION_TYPE_LABELS } from './organization.model';

type LevelFilter = OrganizationLevel | 'all';

@Component({
  selector: 'app-organizations',
  imports: [MatButtonToggleModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organizations.html',
})
export class Organizations {
  private readonly resource = httpResource<Organization[]>(() => '/data/udruzenja.json');

  protected readonly typeLabels = ORGANIZATION_TYPE_LABELS;
  protected readonly levelLabels = ORGANIZATION_LEVEL_LABELS;
  protected readonly levels = Object.keys(ORGANIZATION_LEVEL_LABELS) as OrganizationLevel[];
  protected readonly level = signal<LevelFilter>('all');
  protected readonly isLoading = this.resource.isLoading;
  protected readonly hasError = computed(() => !!this.resource.error());

  private readonly organizations = computed(() => (this.resource.hasValue() ? this.resource.value() : []));

  protected readonly filtered = computed(() => {
    const level = this.level();
    return this.organizations()
      .filter((organization) => level === 'all' || organization.level === level)
      .sort((a, b) => this.levels.indexOf(a.level) - this.levels.indexOf(b.level) || a.name.localeCompare(b.name, 'sr'));
  });

  protected setLevel(level: LevelFilter): void {
    this.level.set(level);
  }
}
