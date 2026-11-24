import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/notification.service';
import { MenuOption } from '../options-menu/options-menu';
import { PersonalShareDialog } from './personal-share-dialog';
import { SocialShareDialog } from './social-share-dialog';
import { SocialPost, SocialShareData } from './social.model';

export type ShareAction = 'share-facebook' | 'share-instagram' | 'share-link' | 'share-page';

const DIALOG = { maxWidth: '100vw', panelClass: 'app-dialog-panel', autoFocus: false } as const;

@Injectable({ providedIn: 'root' })
export class SocialShareService {
  readonly #dialog = inject(MatDialog);
  readonly #notifications = inject(NotificationService);
  readonly #auth = inject(AuthService);

  options(dividerBefore = false): MenuOption<ShareAction>[] {
    const link: MenuOption<ShareAction> = { value: 'share-link', label: 'Kopiraj link', icon: 'link' };
    if (this.#auth.isEditor()) {
      return [{ value: 'share-page', label: 'Objavi na mrežama', icon: 'instagram', dividerBefore }, link];
    }
    return [
      { value: 'share-facebook', label: 'Podeli na svom Facebooku', icon: 'facebook', dividerBefore },
      { value: 'share-instagram', label: 'Podeli na svom Instagramu', icon: 'instagram' },
      link,
    ];
  }

  handle(action: string, data: SocialShareData): boolean {
    switch (action) {
      case 'share-facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`, '_blank', 'noopener,width=640,height=560');
        return true;
      case 'share-instagram':
        this.#dialog.open(PersonalShareDialog, { ...DIALOG, data, width: '420px' });
        return true;
      case 'share-link':
        (navigator.clipboard?.writeText(data.url) ?? Promise.reject()).then(
          () => this.#notifications.show('Link je kopiran.'),
          () => this.#notifications.show(data.url),
        );
        return true;
      case 'share-page':
        this.open(data).subscribe();
        return true;
      default:
        return false;
    }
  }

  open(data: SocialShareData): Observable<SocialPost | undefined> {
    return this.#dialog
      .open<SocialShareDialog, SocialShareData, SocialPost>(SocialShareDialog, { ...DIALOG, data, width: '820px' })
      .afterClosed()
      .pipe(
        tap((post) => {
          if (!post) return;
          if (post.status === 'scheduled') {
            this.#notifications.show('Objava je zakazana.');
          } else if (post.status === 'published') {
            this.#notifications.show('Objavljeno na mrežama.');
          } else {
            this.#notifications.show(`Objava nije uspela: ${post.error ?? post.facebook_error ?? 'pokušajte ponovo na stranici Društvene mreže.'}`);
          }
        }),
      );
  }
}
