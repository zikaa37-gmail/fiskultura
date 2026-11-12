import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { NotificationService } from '../../core/notification.service';
import { DialogShell } from '../dialog-shell/dialog-shell';
import { renderSocialCard, SocialKind } from './social-card';
import { SocialShareData } from './social.model';

@Component({
  selector: 'app-personal-share-dialog',
  imports: [MatDialogModule, MatButtonToggleModule, BUTTON_IMPORTS, DialogShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dialog-shell title="Podeli na svom Instagramu">
      <div class="personal-share">
        <mat-button-toggle-group [value]="kind()" (change)="setKind($event.value)" aria-label="Vrsta">
          <mat-button-toggle value="post">Objava</mat-button-toggle>
          <mat-button-toggle value="story">Story</mat-button-toggle>
        </mat-button-toggle-group>
        @if (image(); as src) {
          <img [src]="src" alt="Slika za Instagram" [class.story]="kind() === 'story'" />
        } @else {
          <div class="personal-share-placeholder" [class.story]="kind() === 'story'">Pravim sliku…</div>
        }
        <p class="small muted">
          @if (canShare()) {
            „Podeli” otvara meni telefona: izaberite Instagram. Tekst sa linkom je već kopiran, nalepite ga u opis.
          } @else {
            Instagram na računaru objavu prima samo ručno: preuzmite sliku, na instagram.com kliknite „Create” i nalepite kopirani tekst sa linkom.
            Sa telefona je lakše: tamo „Podeli” otvara Instagram direktno.
          }
        </p>
      </div>
      <ng-container dialogActions>
        <button type="button" mat-stroked-button theme="tertiary" (click)="copy()">Kopiraj tekst</button>
        @if (canShare()) {
          <button type="button" mat-flat-button [disabled]="!image()" (click)="share()">Podeli</button>
        } @else {
          <button type="button" mat-flat-button [disabled]="!image()" (click)="download()">Preuzmi sliku</button>
        }
      </ng-container>
    </app-dialog-shell>
  `,
  styles: `
    .personal-share {
      display: grid;
      gap: 12px;
      justify-items: center;
    }
    .personal-share p {
      margin: 0;
      justify-self: stretch;
    }
    img,
    .personal-share-placeholder {
      width: 100%;
      max-width: 280px;
      aspect-ratio: 4 / 5;
      border-radius: 12px;
      border: 1px solid var(--color-border);
    }
    .story {
      aspect-ratio: 9 / 16;
      max-width: 220px;
    }
    .personal-share-placeholder {
      display: grid;
      place-items: center;
      color: var(--color-muted);
    }
  `,
})
export class PersonalShareDialog {
  protected readonly data = inject<SocialShareData>(MAT_DIALOG_DATA);
  readonly #notifications = inject(NotificationService);

  protected readonly kind = signal<SocialKind>('post');
  protected readonly image = signal<string | null>(null);
  protected readonly canShare = signal(
    typeof navigator !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [new File([], 'x.jpg', { type: 'image/jpeg' })] }),
  );

  constructor() {
    this.#render();
    this.#writeClipboard();
  }

  protected setKind(kind: SocialKind): void {
    this.kind.set(kind);
    this.#render();
  }

  protected copy(): void {
    this.#writeClipboard().then((ok) => this.#notifications.show(ok ? 'Tekst sa linkom je kopiran.' : 'Kopiranje nije uspelo.'));
  }

  protected async share(): Promise<void> {
    const file = this.#file();
    if (!file) return;
    try {
      await navigator.share({ files: [file], title: this.data.title, text: this.data.caption });
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') {
        this.download();
      }
    }
  }

  protected download(): void {
    const src = this.image();
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = this.#fileName();
    link.click();
    this.#writeClipboard().then((ok) => ok && this.#notifications.show('Slika je preuzeta, tekst sa linkom je kopiran.'));
  }

  #render(): void {
    this.image.set(null);
    renderSocialCard(this.data.title, this.data.label ?? '', this.kind()).then((src) => this.image.set(src));
  }

  #file(): File | null {
    const src = this.image();
    if (!src) return null;
    const bytes = atob(src.split(',')[1]);
    const buffer = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);
    return new File([buffer], this.#fileName(), { type: 'image/jpeg' });
  }

  #fileName(): string {
    return `fiskultura-${this.kind()}.jpg`;
  }

  #writeClipboard(): Promise<boolean> {
    return navigator.clipboard?.writeText(this.data.caption).then(() => true, () => false) ?? Promise.resolve(false);
  }
}
