import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Organization } from '../organizations/organization.model';
import { NEWS_CATEGORY_LABELS, NewsCategory, OrganizationPost } from './news.model';

type CategoryFilter = NewsCategory | 'all';

@Component({
  selector: 'app-news',
  imports: [MatButtonToggleModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news.html',
})
export class News {
  private readonly postsResource = httpResource<OrganizationPost[]>(() => '/data/objave.json');
  private readonly organizationsResource = httpResource<Organization[]>(() => '/data/udruzenja.json');

  protected readonly categoryLabels = NEWS_CATEGORY_LABELS;
  protected readonly categories = Object.keys(NEWS_CATEGORY_LABELS) as NewsCategory[];
  protected readonly category = signal<CategoryFilter>('all');
  protected readonly isLoading = computed(() => this.postsResource.isLoading() || this.organizationsResource.isLoading());
  protected readonly hasError = computed(() => !!this.postsResource.error());

  private readonly organizationNames = computed(() => {
    const organizations = this.organizationsResource.hasValue() ? this.organizationsResource.value() : [];
    return new Map(organizations.map((organization) => [organization.slug, organization.shortName ?? organization.name]));
  });

  protected readonly posts = computed(() => {
    const category = this.category();
    const names = this.organizationNames();
    const posts = this.postsResource.hasValue() ? this.postsResource.value() : [];
    return posts
      .filter((post) => category === 'all' || post.category === category)
      .map((post) => ({ ...post, organizationName: names.get(post.organization) ?? post.organization, displayDate: this.formatDate(post.date) }))
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  });

  protected setCategory(category: CategoryFilter): void {
    this.category.set(category);
  }

  private formatDate(date: string | null): string {
    if (!date) {
      return '';
    }
    const [year, month, day] = date.split('-');
    return day ? `${Number(day)}. ${Number(month)}. ${year}.` : `${Number(month)}/${year}.`;
  }
}
