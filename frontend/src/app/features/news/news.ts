import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticlesShowcase } from '../articles/articles-showcase';
import { NewsList } from './news-list';

@Component({
  selector: 'app-news',
  imports: [RouterLink, ArticlesShowcase, NewsList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news.html',
})
export class News {}
