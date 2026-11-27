import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { ArticlesShowcase } from '../articles/articles-showcase';
import { NewsList } from './news-list';

@Component({
  selector: 'app-news',
  imports: [RouterLink, MatTabsModule, ArticlesShowcase, NewsList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news.html',
})
export class News {
  readonly prikaz = input<string>();
  protected readonly tab = computed(() => (this.prikaz() === 'price' ? 'price' : 'vesti'));
}
