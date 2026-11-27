import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/auth/auth.service';
import { MEMBER_STATUS_LABELS, MEMBER_STATUSES, MemberStatus, UserSchool } from '../../core/auth/user.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { DISTRICTS } from '../../content/districts';
import { Page } from '../admin/admin.model';
import { FilterChange, FilterField, ListFilters } from '../../shared/list-filters/list-filters';
import { queryFilters } from '../../shared/list-filters/query-filters';
import { ListHeader } from '../../shared/list-header/list-header';
import { Pagination } from '../../shared/pagination/pagination';
import { DirectoryTabs } from './directory-tabs';
import { MemberPlacesStore } from './member-places.store';

interface Member {
  id: number;
  name: string;
  member_status: MemberStatus | null;
  school: string | null;
  schools: UserSchool[];
  municipality: string | null;
  district: string | null;
}

@Component({
  selector: 'app-directory',
  imports: [
    Pagination,
    RouterLink,
    BUTTON_IMPORTS,
    MatProgressBarModule,
    ListFilters,
    ListHeader,
    DirectoryTabs,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section section-compact">
      <div class="container">
        <h1 class="page-title mb-3">Imenik</h1>

        <app-directory-tabs active="kolege">
        @if (consentRequired()) {
          <div class="auth-card directory-consent">
            <h2>Imenik vide oni koji su i sami u njemu</h2>
            <p>
              Ako pristaneš, kolege će videti tvoje ime, status, školu, opštinu i okrug. Mejl se ne
              prikazuje nikome. Saglasnost možeš da isključiš u profilu kad hoćeš.
            </p>
            <div class="profile-links">
              <button type="button" mat-flat-button [disabled]="busy()" (click)="join()">
                Uključi me u imenik
              </button>
              <a mat-stroked-button routerLink="/profil">Na profil</a>
            </div>
          </div>
        } @else {
          <app-list-filters
            [fields]="fields()"
            [values]="filters.values()"
            emptySummary="Sve kolege"
            (filterChange)="setFilter($event)"
            (clearAll)="filters.clear()"
          />

          @if (resource.isLoading()) {
            <mat-progress-bar mode="indeterminate" />
          }
          @if (loadError(); as message) {
            <p class="form-error" role="alert">{{ message }}</p>
          }
          <app-list-header
            [count]="meta()?.total ?? null"
            [page]="meta()?.page ?? null"
            [lastPage]="meta()?.last_page ?? null"
            label="U imeniku"
          />
          <div class="directory-grid">
            @for (member of items(); track member.id) {
              <article class="directory-card">
                <strong>{{ member.name }}</strong>
                @if (member.member_status) {
                  <span class="reg-label">{{ statusLabels[member.member_status] }}</span>
                }
                @for (school of member.schools; track $index) {
                  <span class="small member-school">
                    {{ school.name }}
                    @if (school.share < 100) {
                      <span class="share-label" [title]="'Angažovanje u ovoj školi: ' + school.share + '%'">{{ school.share }}%</span>
                    }
                  </span>
                } @empty {
                  @if (member.school) {
                    <span class="small">{{ member.school }}</span>
                  }
                }
                @if (member.municipality || member.district) {
                  <span class="small muted">{{ place(member) }}</span>
                }
              </article>
            } @empty {
              @if (!resource.isLoading() && meta()) {
                <p class="muted">Nema kolega za izabrane filtere.</p>
              }
            }
          </div>
          @if (meta(); as info) {
            <app-pagination
              [page]="info.page"
              [lastPage]="info.last_page"
              (pageChange)="goToPage($event)"
            />
          }
        }
        </app-directory-tabs>
      </div>
    </section>
  `,
})
export class Directory {
  readonly #auth = inject(AuthService);
  readonly #notifications = inject(NotificationService);

  readonly #router = inject(Router);

  protected readonly statusLabels = MEMBER_STATUS_LABELS;
  readonly #places = inject(MemberPlacesStore);
  protected readonly filters = queryFilters(['status', 'okrug', 'opstina', 'pretraga', 'strana']);
  protected readonly fields = computed<FilterField[]>(() => {
    const district = this.filters.values()['okrug'];
    const municipalities = [
      ...new Set(
        (this.#places.places() ?? [])
          .filter((place) => !district || place.district === district)
          .map((place) => place.municipality),
      ),
    ].sort((a, b) => a.localeCompare(b, 'sr'));
    return [
    {
      key: 'status',
      label: 'Status',
      allLabel: 'Svi',
      options: MEMBER_STATUSES.map((value) => ({ value, label: MEMBER_STATUS_LABELS[value] })),
    },
    {
      key: 'okrug',
      label: 'Okrug',
      type: 'select-search',
      allLabel: 'Svi okruzi',
      options: DISTRICTS.map((value) => ({ value, label: value })),
    },
    {
      key: 'opstina',
      label: 'Opština / grad',
      type: 'select-search',
      allLabel: 'Sve opštine',
      options: municipalities.map((value) => ({ value, label: value })),
    },
    { key: 'pretraga', label: 'Ime, škola ili opština', type: 'search' },
    ];
  });
  protected readonly busy = signal(false);

  protected readonly resource = httpResource<Page<Member>>(() => {
    const values = this.filters.values();
    const status = MEMBER_STATUSES.includes(values['status'] as MemberStatus) ? values['status'] : '';
    return {
      url: `${API_URL}/members`,
      params: {
        ...(status ? { member_status: status } : {}),
        ...(values['okrug'] ? { district: values['okrug'] } : {}),
        ...(values['opstina'] ? { municipality: values['opstina'] } : {}),
        ...(values['pretraga'] ? { q: values['pretraga'] } : {}),
        page: Math.max(1, Number(values['strana']) || 1),
      },
    };
  });
  readonly #lastPage = linkedSignal<Page<Member> | undefined, Page<Member> | null>({
    source: () => (this.resource.hasValue() ? this.resource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value ?? null,
  });
  protected readonly items = computed(() => this.#lastPage()?.data ?? []);
  protected readonly meta = computed(() => this.#lastPage()?.meta ?? null);
  protected readonly consentRequired = computed(() => {
    const error = this.resource.error();
    return error instanceof HttpErrorResponse && error.status === 403;
  });
  protected readonly loadError = computed(() => {
    const error = this.resource.error();
    return error && !this.consentRequired() ? apiErrorMessage(error) : null;
  });

  constructor() {
    effect(() => {
      if (this.resource.hasValue()) {
        untracked(() => this.#places.load());
      }
    });
  }

  protected setFilter(change: FilterChange): void {
    this.#router.navigate([], {
      queryParams: {
        [change.key]: change.value || null,
        strana: null,
        ...(change.key === 'okrug' ? { opstina: null } : {}),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected goToPage(page: number): void {
    this.#router.navigate([], { queryParams: { strana: page > 1 ? page : null }, queryParamsHandling: 'merge' });
  }

  protected place(member: Member): string {
    return [member.municipality, member.district].filter(Boolean).join(', ');
  }

  protected join(): void {
    const user = this.#auth.currentUser();
    if (!user) {
      return;
    }
    this.busy.set(true);
    this.#auth
      .updateProfile({
        name: user.name,
        member_status: user.member_status,
        schools: user.schools ?? [],
        municipality: user.municipality,
        district: user.district,
        directory_consent: true,
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.#notifications.show('Sada si u imeniku struke.');
          this.resource.reload();
        },
        error: (error) => {
          this.busy.set(false);
          this.#notifications.show(apiErrorMessage(error));
        },
      });
  }
}
