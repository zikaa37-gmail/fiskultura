import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { API_URL } from '../../core/http/api';
import { Organization, OrganizationType } from '../../core/content/content.model';
import { OrganizationCard } from './organization-card';

const UMBRELLA_SLUG = 'sspfvs';

const SECTION_ORDER: OrganizationType[] = ['strukovno-udruzenje', 'skolski-sport', 'institucija', 'fakultet', 'sindikat', 'ostalo'];

const SECTION_TITLES: Record<OrganizationType, string> = {
  'strukovno-udruzenje': 'Ostala strukovna udruženja',
  'skolski-sport': 'Školski sport',
  institucija: 'Institucije',
  fakultet: 'Fakulteti',
  sindikat: 'Sindikati prosvete',
  ostalo: 'Ostale organizacije',
};

@Component({
  selector: 'app-organizations',
  imports: [BUTTON_IMPORTS, MatProgressBarModule, OrganizationCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organizations.html',
})
export class Organizations {
  private readonly resource = httpResource<Organization[]>(() => `${API_URL}/organizations`);

  protected readonly isLoading = this.resource.isLoading;
  protected readonly hasError = computed(() => !!this.resource.error());

  private readonly organizations = computed(() => (this.resource.hasValue() ? this.resource.value() : []));

  protected readonly umbrella = computed(() => this.organizations().find((organization) => organization.slug === UMBRELLA_SLUG) ?? null);

  protected readonly members = computed(() =>
    this.organizations()
      .filter((organization) => organization.parent?.slug === UMBRELLA_SLUG)
      .sort((a, b) => (a.city ?? '').localeCompare(b.city ?? '', 'sr')),
  );

  protected readonly sections = computed(() => {
    const rest = this.organizations().filter((organization) => organization.slug !== UMBRELLA_SLUG && organization.parent?.slug !== UMBRELLA_SLUG);
    return SECTION_ORDER.map((type) => ({
      type,
      title: SECTION_TITLES[type],
      organizations: rest.filter((organization) => organization.type === type).sort((a, b) => a.name.localeCompare(b.name, 'sr')),
    })).filter((section) => section.organizations.length > 0);
  });

  protected readonly umbrellaEmail = computed(() => this.umbrella()?.email ?? null);
}
