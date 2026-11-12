import { ChangeDetectionStrategy, Component, inject, input, linkedSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { AuthService } from '../../core/auth/auth.service';
import { formatDate } from '../../core/content/content.model';
import { DeleteService } from '../../core/delete.service';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { SITE_URL } from '../../core/seo/seo.service';
import { Icon } from '../../shared/icon/icon';
import { ListHeader } from '../../shared/list-header/list-header';
import { MenuOption, OptionsMenu } from '../../shared/options-menu/options-menu';
import { SOCIAL_STATUS_LABELS, SocialPost, SocialState, SocialStatus } from '../../shared/social-share/social.model';
import { SocialShareService } from '../../shared/social-share/social-share.service';

type PostAction = 'instagram' | 'facebook' | 'retry' | 'remove';

@Component({
  selector: 'app-admin-social',
  imports: [FormsModule, MatInputModule, MatProgressBarModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, Icon, ListHeader, OptionsMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="social-accounts mb-4">
      <article class="social-account accent-primary">
        <span class="tint-icon"><app-icon name="instagram" /></span>
        <div class="social-account-main">
          <strong>Instagram</strong>
          @if (state.value()?.connected) {
            @if (state.value()?.via_facebook) {
              <span class="small">&#64;{{ state.value()?.username }} · preko Facebook stranice</span>
            } @else {
              <span class="small">&#64;{{ state.value()?.username }} · token važi do {{ date(state.value()?.token_expires_at) }}, sam se obnavlja</span>
            }
          } @else {
            <span class="small muted">Nije povezan</span>
          }
        </div>
        @if (auth.isAdmin()) {
          @if (state.value()?.connected) {
            <button type="button" mat-stroked-button theme="danger" size="sm" (click)="disconnect('instagram')">Odvoji</button>
          } @else if (state.value()?.oauth?.instagram) {
            <button type="button" mat-flat-button size="sm" [disabled]="busy()" (click)="authorize('instagram')">Poveži</button>
          }
        }
      </article>
      <article class="social-account accent-primary">
        <span class="tint-icon"><app-icon name="facebook" /></span>
        <div class="social-account-main">
          <strong>Facebook stranica</strong>
          @if (state.value()?.facebook?.connected) {
            <span class="small">{{ state.value()?.facebook?.username }}</span>
          } @else {
            <span class="small muted">Nije povezana</span>
          }
        </div>
        @if (auth.isAdmin()) {
          @if (state.value()?.facebook?.connected) {
            <button type="button" mat-stroked-button theme="danger" size="sm" (click)="disconnect('facebook')">Odvoji</button>
          } @else if (state.value()?.oauth?.facebook) {
            <button type="button" mat-flat-button size="sm" [disabled]="busy()" (click)="authorize('facebook')">Poveži</button>
          }
        }
      </article>
    </div>

    @if (auth.isAdmin()) {
      @if (state.value(); as current) {
        @if (!current.oauth.instagram || !current.oauth.facebook) {
          <p class="small muted mb-3">
            Dugme „Poveži” radi kad su na serveru upisani ID i tajna Meta aplikacije. Do tada nalepite token sistemskog korisnika ispod.
          </p>
        }
      }
      <details class="social-connect mb-4" [open]="!state.value()?.facebook?.connected">
        <summary>Poveži tokenom</summary>
        <div class="social-connect-grid">
          <form class="social-connect-form" (ngSubmit)="connectFacebook()">
            <strong>Facebook stranica i Instagram (jedan token)</strong>
            <p class="small muted">
              business.facebook.com → Settings → Users → System users → izaberite korisnika → Generate new token (aplikacija Portal Fiskultura,
              trajanje „Never”, dozvole pages_show_list, pages_read_engagement, pages_manage_posts, instagram_basic, instagram_content_publish).
              Portal sam pronađe Instagram nalog povezan sa stranicom.
            </p>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>ID stranice</mat-label>
              <input matInput name="fbPage" inputmode="numeric" autocomplete="off" [ngModel]="fbPage()" (ngModelChange)="fbPage.set($event)" />
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Token sistemskog korisnika</mat-label>
              <input matInput name="fbToken" type="password" autocomplete="off" [ngModel]="fbToken()" (ngModelChange)="fbToken.set($event)" />
            </mat-form-field>
            <button type="submit" mat-flat-button [disabled]="busy() || !fbPage().trim() || fbToken().trim().length < 20">Poveži</button>
          </form>
          <form class="social-connect-form" (ngSubmit)="connectInstagram()">
            <strong>Samo Instagram (stari način)</strong>
            <p class="small muted">Token „Instagram API sa Instagram prijavom”. Za nove Meta aplikacije koristite token levo.</p>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Instagram token</mat-label>
              <input matInput name="igToken" type="password" autocomplete="off" [ngModel]="igToken()" (ngModelChange)="igToken.set($event)" />
            </mat-form-field>
            <button type="submit" mat-stroked-button theme="tertiary" [disabled]="busy() || igToken().trim().length < 20">Poveži Instagram</button>
          </form>
        </div>
      </details>
    }

    <app-list-header [count]="posts.value()?.length ?? null" label="Objava">
      <button type="button" mat-flat-button (click)="compose()">Nova objava</button>
    </app-list-header>
    @if (posts.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <div class="admin-rows">
      @for (post of posts.value() ?? []; track post.id) {
        <div class="admin-row admin-row-compact">
          <div class="admin-row-main">
            <span class="admin-row-meta">
              <span class="state-chip" [class]="chip(post.status)">{{ statusLabels[post.status] }}</span>
              <span>{{ post.kind === 'story' ? 'Story' : 'Objava' }}</span>
              @if (post.networks.includes('instagram')) {
                <span class="state-chip" [class]="post.permalink ? 'state-ok' : post.error ? 'state-danger' : 'state-muted'">Instagram</span>
              }
              @if (post.networks.includes('facebook')) {
                <span class="state-chip" [class]="chip(post.facebook_status ?? 'scheduled')">Facebook</span>
              }
              <span>{{ post.status === 'published' ? date(post.published_at) : date(post.scheduled_at, true) }}</span>
              @if (post.author) {
                <span>{{ post.author }}</span>
              }
            </span>
            <span class="post-title">{{ firstLine(post) }}</span>
            @if (post.error) {
              <span class="small form-error">Instagram: {{ post.error }}</span>
            }
            @if (post.facebook_error && post.facebook_status !== 'published') {
              <span class="small form-error">Facebook: {{ post.facebook_error }}</span>
            }
          </div>
          <app-options-menu [options]="menuFor(post)" [label]="'Opcije objave ' + post.id" (selected)="onAction(post, $event)" />
        </div>
      } @empty {
        @if (!posts.isLoading()) {
          <p class="muted">Još nema objava. Objavu možete napraviti i iz vesti ili debate (tri tačke → Objavi na mreže).</p>
        }
      }
    </div>
  `,
  styles: `
    .social-accounts {
      display: grid;
      gap: 8px;
    }
    .social-account {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      background: var(--color-surface);
    }
    .social-account-main {
      display: grid;
      flex: 1;
      min-width: 0;
    }
    .social-connect summary {
      cursor: pointer;
      min-height: 44px;
      display: flex;
      align-items: center;
      font-weight: 600;
    }
    .social-connect-grid {
      display: grid;
      gap: 16px;
    }
    .social-connect-form {
      display: grid;
      gap: 8px;
      align-content: start;
    }
    .social-connect-form p {
      margin: 0;
      overflow-wrap: anywhere;
    }
    mat-form-field {
      width: 100%;
    }
    @media (min-width: 760px) {
      .social-accounts,
      .social-connect-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
  `,
})
export class AdminSocial {
  readonly #http = inject(HttpClient);
  readonly #notifications = inject(NotificationService);
  readonly #delete = inject(DeleteService);
  readonly #share = inject(SocialShareService);
  protected readonly auth = inject(AuthService);

  protected readonly state = httpResource<SocialState>(() => `${API_URL}/admin/instagram`);
  protected readonly posts = httpResource<SocialPost[]>(() => `${API_URL}/admin/instagram/posts`);
  protected readonly statusLabels = SOCIAL_STATUS_LABELS;

  protected readonly igToken = signal('');
  protected readonly fbPage = linkedSignal(() => this.state.value()?.facebook?.page_id ?? '');
  readonly povezano = input<string>();
  readonly greska = input<string>();
  readonly #router = inject(Router);
  protected readonly fbToken = signal('');
  protected readonly busy = signal(false);

  constructor() {
    queueMicrotask(() => {
      const done = this.povezano();
      const error = this.greska();
      if (done || error) {
        this.#notifications.show(error ?? (done === 'facebook' ? 'Facebook stranica je povezana.' : 'Instagram je povezan.'));
        this.#router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });
  }

  protected authorize(network: 'instagram' | 'facebook'): void {
    this.busy.set(true);
    this.#http.post<{ url: string }>(`${API_URL}/admin/social/${network}/authorize`, {}).subscribe({
      next: ({ url }) => window.location.assign(url),
      error: (error) => {
        this.busy.set(false);
        this.#notifications.show(apiErrorMessage(error));
      },
    });
  }

  protected compose(): void {
    this.#share.open({ title: 'Portal za nastavnike fizičkog vaspitanja', caption: '', url: SITE_URL }).subscribe(() => this.posts.reload());
  }

  protected connectInstagram(): void {
    this.#send(this.#http.post(`${API_URL}/admin/instagram/connect`, { token: this.igToken().trim() }), 'Instagram je povezan.', () => this.igToken.set(''));
  }

  protected connectFacebook(): void {
    this.#send(this.#http.post(`${API_URL}/admin/facebook/connect`, { page_id: this.fbPage().trim(), token: this.fbToken().trim() }), 'Povezano. Ako je Instagram povezan sa stranicom, i on je spreman.', () => this.fbToken.set(''));
  }

  protected disconnect(network: 'instagram' | 'facebook'): void {
    this.#send(this.#http.delete(`${API_URL}/admin/${network}`), network === 'instagram' ? 'Instagram je odvojen.' : 'Facebook stranica je odvojena.');
  }

  protected menuFor(post: SocialPost): MenuOption<PostAction>[] {
    const options: MenuOption<PostAction>[] = [];
    if (post.permalink) options.push({ value: 'instagram', label: 'Otvori na Instagramu', icon: 'instagram' });
    if (post.facebook_permalink) options.push({ value: 'facebook', label: 'Otvori na Facebooku', icon: 'facebook' });
    if ((post.status === 'failed' || post.status === 'scheduled') && post.image_url) {
      options.push({ value: 'retry', label: post.status === 'failed' ? 'Pokušaj ponovo' : 'Objavi odmah', icon: 'check' });
    }
    if (post.status !== 'published') options.push({ value: 'remove', label: 'Obriši', icon: 'trash', danger: true, dividerBefore: true });
    return options;
  }

  protected onAction(post: SocialPost, action: PostAction): void {
    if (action === 'instagram' || action === 'facebook') {
      window.open((action === 'instagram' ? post.permalink : post.facebook_permalink) ?? '', '_blank', 'noopener');
    } else if (action === 'retry') {
      this.#send(this.#http.post<SocialPost>(`${API_URL}/admin/instagram/posts/${post.id}/publish`, {}), 'Poslato na mreže.');
    } else {
      this.#delete.confirmDelete({ title: 'Brisanje objave', message: 'Obrisati ovu objavu? Još nije objavljena.', url: `${API_URL}/admin/instagram/posts/${post.id}`, success: 'Objava je obrisana.' }, () => this.posts.reload());
    }
  }

  protected chip(status: SocialStatus): string {
    return status === 'published' ? 'state-ok' : status === 'failed' ? 'state-danger' : status === 'scheduled' ? 'state-warn' : 'state-muted';
  }

  protected firstLine(post: SocialPost): string {
    return post.caption?.split('\n')[0] || (post.kind === 'story' ? 'Story (samo slika)' : 'Bez teksta');
  }

  protected date(value: string | null | undefined, withTime = false): string {
    if (!value) return '—';
    return withTime ? new Date(value).toLocaleString('sr-Latn-RS', { dateStyle: 'medium', timeStyle: 'short' }) : formatDate(value);
  }

  #send(request: Observable<unknown>, message: string, done?: () => void): void {
    this.busy.set(true);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        done?.();
        this.#notifications.show(message);
        this.state.reload();
        this.posts.reload();
      },
      error: (error) => {
        this.busy.set(false);
        this.#notifications.show(apiErrorMessage(error));
      },
    });
  }
}
