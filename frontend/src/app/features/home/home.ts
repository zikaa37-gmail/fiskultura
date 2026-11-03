import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ModuleCard } from '../../shared/module-card/module-card';
import { APP_LINKS, EXERCISES, PORTAL_MODULES } from '../../content/portal-content';

const DAY_MS = 86_400_000;

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, ModuleCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home {
  protected readonly modules = PORTAL_MODULES;
  protected readonly ePripremeUrl = APP_LINKS.ePripreme;
  protected readonly exerciseIndex = signal(Math.floor(Date.now() / DAY_MS) % EXERCISES.length);
  protected readonly exercise = computed(() => EXERCISES[this.exerciseIndex()]);

  protected nextExercise(): void {
    this.exerciseIndex.update((index) => (index + 1) % EXERCISES.length);
  }
}
