import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { httpResource } from '@angular/common/http';
import { ModuleCard } from '../../shared/module-card/module-card';
import { NewsCard } from '../../shared/news-card/news-card';
import { API_URL } from '../../core/http/api';
import { NewsPage } from '../../core/content/content.model';
import { APP_LINKS, EXERCISES, PORTAL_MODULES } from '../../content/portal-content';

const DAY_MS = 86_400_000;

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, ModuleCard, NewsCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home {
  readonly #latestResource = httpResource<NewsPage>(() => ({ url: `${API_URL}/news/list`, method: 'POST', body: { per_page: 3 } }));
  protected readonly latestNews = computed(() => (this.#latestResource.hasValue() ? this.#latestResource.value().data : []));
  protected readonly modules = PORTAL_MODULES;
  protected readonly ePripremeUrl = APP_LINKS.ePripreme;
  protected readonly exerciseIndex = signal(Math.floor(Date.now() / DAY_MS) % EXERCISES.length);
  protected readonly exercise = computed(() => EXERCISES[this.exerciseIndex()]);

  protected nextExercise(): void {
    this.exerciseIndex.update((index) => (index + 1) % EXERCISES.length);
  }
}
