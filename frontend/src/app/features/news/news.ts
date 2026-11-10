import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsList } from './news-list';

@Component({
  selector: 'app-news',
  imports: [RouterLink, NewsList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news.html',
})
export class News {}
