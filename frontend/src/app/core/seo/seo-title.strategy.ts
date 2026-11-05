import { inject, Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SeoService } from './seo.service';

@Injectable()
export class SeoTitleStrategy extends TitleStrategy {
  readonly #seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.#seo.applyRoute(snapshot.root, snapshot.url);
  }
}
