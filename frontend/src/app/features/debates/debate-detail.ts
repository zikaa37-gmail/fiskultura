import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { formatDate } from '../../core/content/content.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { SeoService } from '../../core/seo/seo.service';
import { debateShare } from '../../shared/social-share/share-data';
import { ShareMenu } from '../../shared/social-share/share-menu';
import { Icon } from '../../shared/icon/icon';
import { FilterChange, FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { Pagination } from '../../shared/pagination/pagination';
import { DebateDetail as Detail, DEBATE_STATUS_LABELS, DebatePost, POST_KIND_ICONS, POST_KIND_LABELS, PostKind, ReactionType } from './debate.model';
import { DebateModeration } from './debate-moderation';
import { DebatePostCard, PostAction } from './debate-post-card';
import { DebateSummaryCard } from './debate-summary';
import { DebateIntroCard } from './debate-intro';
import { ReopenRequestDialog } from './reopen-request-dialog';
import { BanDialog } from './ban-dialog';

interface PostsPage {
  data: DebatePost[];
  meta: { current_page: number; last_page: number; total: number };
}

const KINDS = Object.keys(POST_KIND_LABELS) as PostKind[];
const SORTS = ['new', 'top', 'old'];

@Component({
  selector: 'app-debate-detail',
  imports: [FormsModule, RouterLink, MatInputModule, MatProgressBarModule, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, Icon, ListFilters, ListHeader, Pagination, DebatePostCard, DebateSummaryCard, DebateModeration, DebateIntroCard, ShareMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section qa-section">
      <div class="container debate-page">
        <a class="inline-link back-link" routerLink="/debate"><app-icon name="arrow-left" [size]="16" /> Sve stručne debate</a>
        @if (detail.isLoading() && !debate()) {
          <mat-progress-bar mode="indeterminate" />
        }
        @if (detail.error()) {
          <div class="empty-state"><h1>Tema nije pronađena</h1><p class="muted">Možda je obrisana ili još čeka odobrenje.</p></div>
        }
        @if (debate(); as item) {
          <header class="debate-head">
            <div class="post-head">
              <span class="post-meta">
                <span class="state-chip" [class]="item.status === 'open' ? 'state-ok' : item.status === 'proposed' ? 'state-warn' : 'state-muted'">{{ statusLabels[item.status] }}</span>
                <span>{{ item.posts_count }} priloga</span>
                <span>moderator: {{ item.moderator?.name ?? 'nije dodeljen' }}</span>
              </span>
              @if (item.status === 'open' || item.status === 'closed') {
                <app-share-menu [data]="share(item)" />
              }
            </div>
            <h1>{{ item.title }}</h1>
            @if (item.description) {
              <p class="lead">{{ item.description }}</p>
            }
          </header>

          @if (item.intro; as intro) {
            <app-debate-intro [intro]="intro" />
          }

          @if (item.can_moderate) {
            <app-debate-moderation [debate]="item" (changed)="refresh()" />
          }

          @if (item.summary; as summary) {
            <app-debate-summary [summary]="summary" />
          } @else if (item.posts_count >= 3) {
            <p class="small muted">Sažetak rasprave još nije objavljen. Moderator ga objavljuje kad se skupi dovoljno mišljenja.</p>
          }

          <section aria-labelledby="posts-title">
            <h2 id="posts-title" class="mb-3">Prilozi</h2>
            @if (item.my_ban; as ban) {
              <div class="frozen-note mb-4" role="status">
                <p class="small"><strong>Ne možeš da pišeš priloge.</strong> {{ ban.message }}</p>
              </div>
            } @else if (item.status === 'open') {
              @if (composing()) {
                <form class="composer mb-4" (ngSubmit)="send()">
                  <div class="chip-row" role="group" aria-label="Vrsta priloga">
                    @for (kind of kinds; track kind) {
                      <button type="button" [matButton]="draftKind() === kind ? 'filled' : 'outlined'" [theme]="draftKind() === kind ? 'primary' : 'tertiary'" size="sm" [attr.aria-pressed]="draftKind() === kind" (click)="draftKind.set(kind)">
                        <app-icon [name]="kindIcons[kind]" [size]="16" /> {{ kindLabels[kind] }}
                      </button>
                    }
                  </div>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Šta želiš da kažeš</mat-label>
                    <textarea matInput name="body" rows="5" maxlength="5000" [ngModel]="draftBody()" (ngModelChange)="draftBody.set($event)"></textarea>
                  </mat-form-field>
                  <p class="small muted">Prilog se objavljuje sa tvojim imenom. Piši o temi, bez ličnih napada.</p>
                  <div class="composer-actions">
                    <button type="button" mat-stroked-button (click)="composing.set(false)">Odustani</button>
                    <button type="submit" mat-flat-button [disabled]="sending()">Objavi prilog</button>
                  </div>
                </form>
              } @else {
                <button type="button" mat-flat-button class="mb-4 say-button" (click)="composing.set(true)">Hoću da kažem</button>
              }
            } @else if (item.status === 'closed') {
              <div class="frozen-note mb-4">
                <p class="small mb-2">
                  <strong>Tema je zatvorena i zamrznuta.</strong> Prilozi, lajkovi, sažetak i zaključci ostaju kakvi jesu.
                </p>
                @if (item.my_reopen_request?.status === 'pending') {
                  <p class="small muted">Tvoj zahtev da se tema ponovo otvori čeka odluku moderatora. Javićemo ti mejlom.</p>
                } @else {
                  @if (item.my_reopen_request?.status === 'rejected') {
                    <p class="small muted mb-2">
                      Moderator nije odobrio tvoj prethodni zahtev{{ item.my_reopen_request?.decision_note ? ': „' + item.my_reopen_request?.decision_note + '“' : '.' }}
                    </p>
                  }
                  <button type="button" mat-stroked-button (click)="requestReopen(item)">Zatraži ponovno otvaranje</button>
                }
              </div>
            }

            <app-list-filters [fields]="fields" [values]="filterValues()" emptySummary="Svi prilozi" (filterChange)="setFilter($event)" (clearAll)="clearFilters()" />
            @if (posts.isLoading()) {
              <mat-progress-bar mode="indeterminate" />
            }
            <app-list-header [count]="meta()?.total ?? null" [page]="page()" [lastPage]="meta()?.last_page ?? null" label="Priloga" />
            <div class="debate-posts">
              @for (post of items(); track post.id) {
                <app-debate-post-card [post]="post" [moderating]="item.can_moderate && item.status === 'open'" [frozen]="item.status !== 'open'" (react)="react(post, $event)" (moderate)="moderate(post, $event)" />
              } @empty {
                @if (!posts.isLoading()) {
                  <p class="muted">{{ hasFilters() ? 'Nema priloga za ovaj izbor.' : 'Još nema priloga. Budi prvi koji će reći šta misli.' }}</p>
                }
              }
            </div>
            @if (meta(); as info) {
              <app-pagination [page]="page()" [lastPage]="info.last_page" (pageChange)="setFilter({ key: 'strana', value: $event > 1 ? '' + $event : '' })" />
            }
          </section>
        }
      </div>
    </section>
  `,
  styles: `
    .debate-page {
      display: grid;
      gap: 16px;
      max-width: 860px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 44px;
      justify-self: start;
    }
    .debate-head {
      display: grid;
      gap: 8px;
    }
    .debate-head h1 {
      margin: 0;
    }
    .composer {
      display: grid;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: var(--color-surface);
    }
    .composer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .say-button {
      width: 100%;
    }
    .frozen-note {
      padding: 12px 16px;
      border: 1px dashed var(--color-border);
      border-radius: var(--radius);
    }
    .frozen-note p {
      margin: 0;
    }
    .debate-posts {
      display: grid;
      gap: 12px;
    }
    @media (min-width: 720px) {
      .say-button {
        width: auto;
      }
    }
  `,
})
export class DebateDetail {
  readonly slug = input.required<string>();
  readonly vrsta = input<string>();
  readonly redosled = input<string>();
  readonly pretraga = input<string>();
  readonly strana = input<string>();

  readonly #http = inject(HttpClient);
  readonly #router = inject(Router);
  readonly #notifications = inject(NotificationService);
  readonly #seo = inject(SeoService);
  readonly #dialog = inject(MatDialog);

  protected readonly statusLabels = DEBATE_STATUS_LABELS;
  protected readonly kindLabels = POST_KIND_LABELS;
  protected readonly kindIcons = POST_KIND_ICONS;
  protected readonly kinds = KINDS;
  protected readonly fields: FilterField[] = [
    { key: 'vrsta', label: 'Vrsta priloga', allLabel: 'Sve vrste', options: KINDS.map((value) => ({ value, label: POST_KIND_LABELS[value] })) },
    {
      key: 'redosled',
      label: 'Redosled',
      allLabel: 'Najnoviji',
      options: [
        { value: 'top', label: 'Najviše lajkova' },
        { value: 'old', label: 'Od početka' },
      ],
    },
    { key: 'pretraga', label: 'Pretraga u temi', type: 'search' },
  ];

  protected readonly detail = httpResource<Detail>(() => `${API_URL}/debates/${this.slug()}`);
  protected readonly debate = computed(() => (this.detail.hasValue() ? this.detail.value() : null));

  protected readonly share = debateShare;

  readonly #kind = computed(() => (KINDS.includes(this.vrsta() as PostKind) ? (this.vrsta() as PostKind) : ''));
  readonly #sort = computed(() => (SORTS.includes(this.redosled() ?? '') ? this.redosled()! : ''));
  protected readonly page = computed(() => Math.max(1, Number(this.strana()) || 1));
  protected readonly filterValues = computed(() => ({ vrsta: this.#kind(), redosled: this.#sort(), pretraga: this.pretraga() ?? '' }));
  protected readonly hasFilters = computed(() => !!(this.#kind() || this.pretraga()));

  protected readonly posts = httpResource<PostsPage>(() => {
    const params = new URLSearchParams({ sort: this.#sort() || 'new', page: `${this.page()}` });
    if (this.#kind()) params.set('kind', this.#kind());
    if (this.pretraga()) params.set('q', this.pretraga()!);
    return `${API_URL}/debates/${this.slug()}/posts?${params}`;
  });
  readonly #page = linkedSignal<PostsPage | undefined, PostsPage | null>({
    source: () => (this.posts.hasValue() ? this.posts.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });
  readonly #overrides = signal<Record<number, Partial<DebatePost>>>({});
  protected readonly items = computed(() => (this.#page()?.data ?? []).map((post) => ({ ...post, ...this.#overrides()[post.id] })));
  protected readonly meta = computed(() => this.#page()?.meta ?? null);

  protected readonly composing = signal(false);
  protected readonly draftKind = signal<PostKind>('statement');
  protected readonly draftBody = signal('');
  protected readonly sending = signal(false);

  constructor() {
    effect(() => {
      const item = this.debate();
      if (item) {
        this.#seo.set({ title: item.title, description: item.description ?? 'Debata nastavnika fizičkog vaspitanja na portalu Fiskultura.', path: `/debate/${item.slug}`, noindex: true });
      }
    });
    effect(() => {
      this.posts.value();
      this.#overrides.set({});
    });
    effect((onCleanup) => {
      if (this.debate()?.intro_busy) {
        const timer = setTimeout(() => this.detail.reload(), 15000);
        onCleanup(() => clearTimeout(timer));
      }
    });
  }

  protected setFilter(change: FilterChange): void {
    const queryParams: Record<string, string | null> = { [change.key]: change.value || null };
    if (change.key !== 'strana') {
      queryParams['strana'] = null;
    }
    this.#router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: change.key !== 'strana' });
  }

  protected clearFilters(): void {
    this.#router.navigate([], { queryParams: {} });
  }

  protected refresh(): void {
    this.detail.reload();
    this.posts.reload();
  }

  protected send(): void {
    const body = this.draftBody().trim();
    if (body.length < 3) {
      this.#notifications.show('Napiši šta želiš da kažeš.');
      return;
    }
    this.sending.set(true);
    this.#http.post<DebatePost>(`${API_URL}/debates/${this.slug()}/posts`, { kind: this.draftKind(), body }).subscribe({
      next: () => {
        this.sending.set(false);
        this.draftBody.set('');
        this.composing.set(false);
        this.#notifications.show('Prilog je objavljen.');
        if (this.page() > 1 || this.#sort() || this.hasFilters()) {
          this.clearFilters();
        }
        this.refresh();
      },
      error: (error) => {
        this.sending.set(false);
        this.#notifications.show(apiErrorMessage(error));
      },
    });
  }

  protected react(post: DebatePost, type: ReactionType): void {
    this.#http
      .post<{ reaction: ReactionType | null; liked: boolean; likes_count: number; reactions: DebatePost['reactions'] }>(`${API_URL}/debate-posts/${post.id}/react`, { type })
      .subscribe({
        next: ({ reaction, liked, likes_count, reactions }) =>
          this.#overrides.update((all) => ({ ...all, [post.id]: { ...all[post.id], reaction, liked, likes_count, reactions } })),
        error: (error) => this.#notifications.show(apiErrorMessage(error)),
      });
  }

  protected moderate(post: DebatePost, action: PostAction): void {
    if (action === 'ban') {
      this.#dialog
        .open<BanDialog, DebatePost, string>(BanDialog, { data: post, width: '560px', maxWidth: '100vw', panelClass: 'app-dialog-panel', autoFocus: false })
        .afterClosed()
        .subscribe((message) => {
          if (message) {
            this.#notifications.show(message);
            this.refresh();
          }
        });
      return;
    }
    const change = action === 'highlight' ? { highlighted: !post.highlighted } : { hidden: !post.hidden };
    this.#http.patch<DebatePost>(`${API_URL}/debate-posts/${post.id}`, change).subscribe({
      next: (saved) => {
        this.#overrides.update((all) => ({ ...all, [post.id]: saved }));
        this.#notifications.show(action === 'highlight' ? (saved.highlighted ? 'Prilog je istaknut.' : 'Isticanje je uklonjeno.') : saved.hidden ? 'Prilog je sakriven.' : 'Prilog je vraćen.');
        if (action === 'hide') {
          this.detail.reload();
        }
      },
      error: (error) => this.#notifications.show(apiErrorMessage(error)),
    });
  }

  protected requestReopen(item: Detail): void {
    this.#dialog
      .open<ReopenRequestDialog, Detail, string>(ReopenRequestDialog, { data: item, width: '640px', maxWidth: '100vw', panelClass: 'app-dialog-panel', autoFocus: false })
      .afterClosed()
      .subscribe((message) => {
        if (message) {
          this.#notifications.show(message);
          this.detail.reload();
        }
      });
  }

  protected date(value: string): string {
    return formatDate(value);
  }
}
