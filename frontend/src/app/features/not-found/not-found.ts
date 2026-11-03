import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container empty-state">
        <h1>Stranica ne postoji</h1>
        <p class="muted">Link je možda zastareo ili pogrešno prepisan.</p>
        <a mat-flat-button routerLink="/">Na naslovnu</a>
      </div>
    </section>
  `,
})
export class NotFound {}
