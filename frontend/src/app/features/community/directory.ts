import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/auth/auth.service';
import { MEMBER_STATUS_LABELS, MEMBER_STATUSES, MemberStatus } from '../../core/auth/user.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { DISTRICTS } from '../../content/districts';
import { Page } from '../admin/admin.model';

interface Member {
  id: number;
  name: string;
  member_status: MemberStatus | null;
  school: string | null;
  municipality: string | null;
  district: string | null;
}

@Component({
  selector: 'app-directory',
  imports: [FormsModule, RouterLink, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatProgressBarModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">Struka</p>
          <h1>Imenik struke</h1>
          <p class="muted">
            Nastavnici fizičkog vaspitanja, pripravnici i studenti koji su pristali da ih kolege vide. Pronađi kolegu iz svog okruga,
            sa fakulteta ili iz škole u kojoj počinješ da radiš.
          </p>
        </div>

        @if (consentRequired()) {
          <div class="auth-card directory-consent">
            <h2>Imenik vide oni koji su i sami u njemu</h2>
            <p>
              Ako pristaneš, kolege će videti tvoje ime, status, školu, opštinu i okrug. Mejl se ne prikazuje nikome. Saglasnost možeš da
              isključiš u profilu kad hoćeš.
            </p>
            <div class="profile-links">
              <button type="button" mat-flat-button [disabled]="busy()" (click)="join()">Uključi me u imenik</button>
              <a mat-stroked-button routerLink="/profil">Na profil</a>
            </div>
          </div>
        } @else {
          <div class="directory-filters mb-3">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Status</mat-label>
              <mat-select [value]="status()" (selectionChange)="status.set($event.value); page.set(1)">
                <mat-option value="">Svi</mat-option>
                @for (option of statuses; track option) {
                  <mat-option [value]="option">{{ statusLabels[option] }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Okrug</mat-label>
              <mat-select [value]="district()" (selectionChange)="district.set($event.value); page.set(1)">
                <mat-option value="">Svi</mat-option>
                @for (option of districts; track option) {
                  <mat-option [value]="option">{{ option }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <form (ngSubmit)="search.set(searchText().trim()); page.set(1)">
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Ime, škola ili opština</mat-label>
                <input matInput name="q" [ngModel]="searchText()" (ngModelChange)="searchText.set($event)" />
              </mat-form-field>
            </form>
          </div>

          @if (resource.isLoading()) {
            <mat-progress-bar mode="indeterminate" />
          }
          @if (loadError(); as message) {
            <p class="form-error" role="alert">{{ message }}</p>
          }
          @if (meta(); as info) {
            <p class="muted small result-count mb-3">U imeniku: {{ info.total }}</p>
          }
          <div class="directory-grid">
            @for (member of items(); track member.id) {
              <article class="directory-card">
                <strong>{{ member.name }}</strong>
                @if (member.member_status) {
                  <span class="reg-label">{{ statusLabels[member.member_status] }}</span>
                }
                @if (member.school) {
                  <span class="small">{{ member.school }}</span>
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
            @if (info.last_page > 1) {
              <nav class="pager" aria-label="Stranice">
                <button type="button" mat-stroked-button [disabled]="info.page <= 1" (click)="page.set(info.page - 1)">← Prethodna</button>
                <span class="muted">Strana {{ info.page }} od {{ info.last_page }}</span>
                <button type="button" mat-stroked-button [disabled]="info.page >= info.last_page" (click)="page.set(info.page + 1)">Sledeća →</button>
              </nav>
            }
          }
        }
      </div>
    </section>
  `,
})
export class Directory {
  readonly #auth = inject(AuthService);
  readonly #notifications = inject(NotificationService);

  protected readonly statuses = MEMBER_STATUSES;
  protected readonly statusLabels = MEMBER_STATUS_LABELS;
  protected readonly districts = DISTRICTS;
  protected readonly status = signal<MemberStatus | ''>('');
  protected readonly district = signal('');
  protected readonly search = signal('');
  protected readonly searchText = linkedSignal(() => this.search());
  protected readonly page = signal(1);
  protected readonly busy = signal(false);

  protected readonly resource = httpResource<Page<Member>>(() => ({
    url: `${API_URL}/members`,
    params: {
      ...(this.status() ? { member_status: this.status() } : {}),
      ...(this.district() ? { district: this.district() } : {}),
      ...(this.search() ? { q: this.search() } : {}),
      page: this.page(),
    },
  }));
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
        school: user.school,
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
