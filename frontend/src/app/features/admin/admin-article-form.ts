import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Observable, of, switchMap } from 'rxjs';
import { BUTTON_IMPORTS } from '../../../theme/ui/button';
import { FORM_FIELD_IMPORTS } from '../../../theme/ui/form-field';
import { AuthService } from '../../core/auth/auth.service';
import { formatDateTime } from '../../core/content/content.model';
import { API_URL, apiErrorMessage } from '../../core/http/api';
import { NotificationService } from '../../core/notification.service';
import { SimpleMarkdownPipe } from '../../shared/simple-markdown.pipe';
import { AdminArticle, ARTICLE_KIND_LABELS, ArticleKind, ArticleOptions, articleState, AuthorProfile } from '../articles/article.model';

@Component({
  selector: 'app-admin-article-form',
  imports: [ReactiveFormsModule, RouterLink, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatProgressBarModule, MatSelectModule, SimpleMarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="inline-link small" routerLink="/admin/tekstovi">← Svi tekstovi</a>
    @if ((isEdit() && resource.isLoading()) || options.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <form class="admin-form" [formGroup]="form" (ngSubmit)="save()">
      <div class="admin-form-head">
        <h2>{{ isEdit() ? 'Tekst' : 'Novi tekst' }}</h2>
        @if (loaded(); as item) {
          @let state = stateOf(item);
          <span class="state-chip" [class]="'state-' + state.tone">{{ state.label }}</span>
          @if (item.is_visible) {
            <a class="inline-link small" [routerLink]="['/tekstovi', item.slug]" target="_blank">Pogledaj na sajtu →</a>
          }
        }
      </div>

      @if (loaded(); as item) {
        @if (item.editor_note && item.status === 'returned') {
          <div class="notice notice-warn" role="status">
            <strong>Napomena urednika</strong>
            <p class="article-text">{{ item.editor_note }}</p>
          </div>
        }
        @if (!item.can_edit) {
          <p class="notice">Tekst je poslat uredniku. Dok ga ne pregleda, ne može da se menja; dobićeš notifikaciju kad bude objavljen ili vraćen na doradu.</p>
        }
        @if (item.status === 'published' && !item.is_visible && item.published_at) {
          <p class="notice">Objava je zakazana za {{ dateTime(item.published_at) }}.</p>
        }
      } @else {
        <p class="muted">Napiši tekst u Wordu ili bilo gde drugde i nalepi ga ovde. Tekst se objavljuje pod tvojim imenom i potpisom, a urednik ga pregleda i po potrebi koriguje pre objave.</p>
      }

      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Vrsta</mat-label>
          <mat-select formControlName="kind">
            @for (option of kinds; track option) {
              <mat-option [value]="option">{{ kindLabels[option] }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Tema</mat-label>
          <mat-select formControlName="topic_id">
            <mat-option [value]="null">— bez teme —</mat-option>
            @for (topic of topics(); track topic.id) {
              <mat-option [value]="topic.id">{{ topic.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Naslov</mat-label>
        <input matInput formControlName="title" maxlength="255" />
      </mat-form-field>
      <mat-form-field subscriptSizing="dynamic" appearance="outline">
        <mat-label>Uvod</mat-label>
        <textarea matInput formControlName="summary" rows="3" maxlength="1000"></textarea>
        <mat-hint>1–3 rečenice o čemu je tekst. Prikazuje se na kartici i ispod naslova.</mat-hint>
      </mat-form-field>
      <mat-form-field subscriptSizing="dynamic" appearance="outline">
        <mat-label>Tekst</mat-label>
        <textarea matInput class="article-paste" formControlName="body" rows="18"></textarea>
        <mat-hint>Nalepi ceo tekst. Prazan red pravi novi pasus, a red koji počinje sa „- ” je stavka liste.</mat-hint>
      </mat-form-field>
      <div>
        <button type="button" mat-stroked-button theme="tertiary" size="sm" (click)="preview.set(!preview())">{{ preview() ? 'Sakrij pregled' : 'Pregled teksta' }}</button>
      </div>
      @if (preview()) {
        <div class="article-preview">
          <h3>{{ form.controls.title.value || 'Naslov' }}</h3>
          <p class="lead">{{ form.controls.summary.value }}</p>
          <div class="article-prose" [innerHTML]="form.controls.body.value | simpleMarkdown"></div>
        </div>
      }

      @if (debates().length) {
        <mat-form-field subscriptSizing="dynamic" appearance="outline">
          <mat-label>Stručna debata (nije obavezno)</mat-label>
          <mat-select formControlName="debate_id">
            <mat-option [value]="null">— nije deo debate —</mat-option>
            @for (debate of debates(); track debate.id) {
              <mat-option [value]="debate.id">{{ debate.title }}</mat-option>
            }
          </mat-select>
          <mat-hint>Ispod teksta ide poziv da se o temi razgovara u debati.</mat-hint>
        </mat-form-field>
      }

      @if (ownText()) {
        <fieldset class="admin-fieldset" [formGroup]="profile">
          <legend>Potpis</legend>
          <p class="small muted mb-3">Tekst se objavljuje pod imenom {{ authorName() }}. Ime se menja u profilu, a potpis i biografija važe za sve tvoje tekstove.</p>
          <mat-form-field subscriptSizing="dynamic" appearance="outline">
            <mat-label>Zvanje, specijalnost i mesto</mat-label>
            <input matInput formControlName="byline" maxlength="160" placeholder="npr. profesor FV, instruktor skijanja, Kopaonik" />
            <mat-hint>Obavezno pre slanja uredniku.</mat-hint>
          </mat-form-field>
          <mat-form-field subscriptSizing="dynamic" appearance="outline">
            <mat-label>Kratka biografija (nije obavezno)</mat-label>
            <textarea matInput formControlName="bio" rows="3" maxlength="1000"></textarea>
            <mat-hint>Gde radiš, šta si završio i koje licence ili zvanja imaš.</mat-hint>
          </mat-form-field>
        </fieldset>
      }

      @if (auth.isEditor()) {
        <fieldset class="admin-fieldset">
          <legend>Pregled urednika</legend>
          <mat-form-field subscriptSizing="dynamic" appearance="outline">
            <mat-label>Napomena autoru</mat-label>
            <textarea matInput formControlName="note" rows="3"></textarea>
            <mat-hint>Za „Vrati na doradu”. Vidi je samo autor, ne i čitaoci.</mat-hint>
          </mat-form-field>
          <div class="form-row">
            <mat-form-field subscriptSizing="dynamic" appearance="outline">
              <mat-label>Vreme objave (nije obavezno)</mat-label>
              <input matInput formControlName="published_at" type="datetime-local" />
              <mat-hint>Prazno = odmah.</mat-hint>
            </mat-form-field>
            <mat-form-field subscriptSizing="dynamic" appearance="outline">
              <mat-label>Adresa (slug, nije obavezno)</mat-label>
              <input matInput formControlName="slug" />
              <mat-hint>Pravi se iz naslova.</mat-hint>
            </mat-form-field>
          </div>
          @if (loaded(); as item) {
            <div class="admin-form-actions">
              <button type="button" mat-flat-button [disabled]="busy()" (click)="publish()">{{ form.controls.published_at.value ? 'Zakaži objavu' : item.status === 'published' ? 'Sačuvaj i objavi' : 'Odobri i objavi' }}</button>
              @if (item.status !== 'published' && item.author_id !== auth.currentUser()?.id) {
                <button type="button" mat-stroked-button [disabled]="busy()" (click)="sendBack()">Vrati na doradu</button>
              }
              @if (item.status === 'published') {
                <button type="button" mat-stroked-button theme="danger" [disabled]="busy()" (click)="unpublish()">Skini sa sajta</button>
              }
            </div>
          }
        </fieldset>
      }

      @if (error(); as message) {
        <p class="form-error" role="alert">{{ message }}</p>
      }
      <div class="admin-form-actions">
        @if (canEdit()) {
          <button type="submit" mat-stroked-button [disabled]="busy()">Sačuvaj nacrt</button>
        }
        @if (canSubmit()) {
          <button type="button" mat-flat-button [disabled]="busy()" (click)="submit()">Pošalji uredniku</button>
        }
        <a mat-button routerLink="/admin/tekstovi">Nazad</a>
      </div>
    </form>
  `,
})
export class AdminArticleForm {
  readonly id = input<string>();

  protected readonly auth = inject(AuthService);
  readonly #http = inject(HttpClient);
  readonly #router = inject(Router);
  readonly #notifications = inject(NotificationService);
  readonly #fb = inject(NonNullableFormBuilder);

  protected readonly kindLabels = ARTICLE_KIND_LABELS;
  protected readonly kinds = Object.keys(ARTICLE_KIND_LABELS) as ArticleKind[];
  protected readonly stateOf = articleState;

  protected readonly isEdit = computed(() => !!this.id());
  protected readonly resource = httpResource<AdminArticle>(() => (this.id() ? `${API_URL}/admin/articles/${this.id()}` : undefined));
  protected readonly loaded = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  protected readonly options = httpResource<ArticleOptions>(() => `${API_URL}/admin/articles/options`);
  protected readonly topics = computed(() => (this.options.hasValue() ? this.options.value().topics : []));
  protected readonly debates = computed(() => (this.options.hasValue() ? this.options.value().debates : []));
  protected readonly authorName = computed(() => (this.options.hasValue() ? this.options.value().profile.name : (this.auth.currentUser()?.name ?? '')));

  protected readonly ownText = computed(() => !this.loaded() || this.loaded()?.author_id === this.auth.currentUser()?.id);
  protected readonly canEdit = computed(() => !this.loaded() || !!this.loaded()?.can_edit);
  protected readonly canSubmit = computed(() => (this.loaded() ? !!this.loaded()?.can_submit : true));

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly preview = signal(false);

  protected readonly form = this.#fb.group({
    kind: ['clanak' as ArticleKind, Validators.required],
    topic_id: [null as number | null],
    title: ['', Validators.required],
    summary: ['', Validators.required],
    body: ['', Validators.required],
    debate_id: [null as number | null],
    slug: [''],
    note: [''],
    published_at: [''],
  });
  protected readonly profile = this.#fb.group({ byline: [''], bio: [''] });

  constructor() {
    effect(() => {
      const item = this.loaded();
      if (!item) {
        return;
      }
      this.form.reset({
        kind: item.kind,
        topic_id: item.topic_id,
        title: item.title,
        summary: item.summary,
        body: item.body ?? '',
        debate_id: item.debate_id,
        slug: item.slug,
        note: item.editor_note ?? '',
        published_at: '',
      });
      if (item.can_edit) {
        this.form.enable();
      } else {
        this.form.disable();
        this.form.controls.note.enable();
        this.form.controls.published_at.enable();
      }
    });
    effect(() => {
      if (this.options.hasValue()) {
        const profile = this.options.value().profile;
        this.profile.reset({ byline: profile.byline ?? '', bio: profile.bio ?? '' });
      }
    });
  }

  protected dateTime(value: string): string {
    return formatDateTime(value);
  }

  protected save(): void {
    this.#run(this.#persist(), 'Nacrt je sačuvan.');
  }

  protected submit(): void {
    if (!this.profile.controls.byline.value.trim()) {
      this.error.set('Pre slanja upiši potpis: zvanje ili specijalnost i mesto.');
      return;
    }
    this.#run(this.#persist().pipe(switchMap((saved) => this.#http.post<AdminArticle>(`${API_URL}/admin/articles/${saved.id}/submit`, {}))), 'Tekst je poslat uredniku.');
  }

  protected publish(): void {
    const at = this.form.controls.published_at.value;
    this.#run(
      this.#persist().pipe(switchMap((saved) => this.#http.post<AdminArticle>(`${API_URL}/admin/articles/${saved.id}/publish`, { published_at: at ? new Date(at).toISOString() : null }))),
      at ? 'Objava je zakazana.' : 'Tekst je objavljen.',
    );
  }

  protected sendBack(): void {
    const note = this.form.controls.note.value.trim();
    if (!note) {
      this.error.set('Upiši napomenu autoru: šta treba doraditi.');
      return;
    }
    this.#run(this.#persist().pipe(switchMap((saved) => this.#http.post<AdminArticle>(`${API_URL}/admin/articles/${saved.id}/return`, { note }))), 'Tekst je vraćen autoru.');
  }

  protected unpublish(): void {
    const item = this.loaded();
    if (item) {
      this.#run(this.#http.post<AdminArticle>(`${API_URL}/admin/articles/${item.id}/unpublish`, {}), 'Tekst je skinut sa sajta.', false);
    }
  }

  #persist(): Observable<AdminArticle> {
    const item = this.loaded();
    const profile: Observable<unknown> = this.ownText() && this.profile.dirty ? this.#http.patch<AuthorProfile>(`${API_URL}/admin/author-profile`, this.profile.getRawValue()) : of(null);
    if (item && !item.can_edit) {
      return profile.pipe(switchMap(() => of(item)));
    }
    const { note, published_at, slug, ...rest } = this.form.getRawValue();
    const payload = { ...rest, ...(this.auth.isEditor() && slug ? { slug } : {}) };
    const request = item ? this.#http.patch<AdminArticle>(`${API_URL}/admin/articles/${item.id}`, payload) : this.#http.post<AdminArticle>(`${API_URL}/admin/articles`, payload);
    return profile.pipe(switchMap(() => request));
  }

  #run(request: Observable<AdminArticle>, success: string, needsContent = true): void {
    if (needsContent && this.canEdit() && this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Popuni naslov, uvod i tekst.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    request.subscribe({
      next: (saved) => {
        this.busy.set(false);
        this.profile.markAsPristine();
        this.#notifications.show(success);
        if (this.id()) {
          this.resource.set(saved);
        } else {
          this.#router.navigate(['/admin/tekstovi', saved.id]);
        }
      },
      error: (error) => {
        this.busy.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }
}
