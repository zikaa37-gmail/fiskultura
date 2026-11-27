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
import { ConfirmService } from '../../shared/confirm-dialog/confirm-dialog';
import { AuthorByline } from '../../shared/author-byline/author-byline';
import { FieldLabel } from '../../shared/field-label/field-label';
import { InfoTip } from '../../shared/info-tip/info-tip';
import { isCustomValue, SelectSearch, SelectSearchValue } from '../../shared/select-search/select-search';
import { SimpleMarkdownPipe } from '../../shared/simple-markdown.pipe';
import { ArticleTopicStore } from '../articles/article-topic-store';
import { AdminArticle, ARTICLE_KIND_LABELS, ArticleAuthor, ArticleKind, ArticleOptions, articleState } from '../articles/article.model';

@Component({
  selector: 'app-admin-article-form',
  imports: [ReactiveFormsModule, RouterLink, BUTTON_IMPORTS, FORM_FIELD_IMPORTS, MatInputModule, MatProgressBarModule, MatSelectModule, AuthorByline, FieldLabel, InfoTip, SelectSearch, SimpleMarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="inline-link small" routerLink="/admin/tekstovi">← Priče kolega</a>
    @if ((isEdit() && resource.isLoading()) || options.isLoading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    <form class="admin-form" [formGroup]="form" (ngSubmit)="save()">
      <div class="admin-form-head">
        <h2 class="title-with-info">
          {{ isEdit() ? 'Priča' : 'Nova priča' }}
          <app-info-tip label="Kako se piše tekst">Napiši tekst u Wordu ili bilo gde drugde i nalepi ga ovde. Tekst se objavljuje pod tvojim imenom i potpisom, a urednik ga pregleda i po potrebi koriguje pre objave.</app-info-tip>
        </h2>
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
      }

      <div class="form-row">
        <div>
          <app-field-label for="article-kind" text="Vrsta" [required]="true" />
          <mat-form-field subscriptSizing="dynamic" appearance="outline">
            <mat-select id="article-kind" formControlName="kind">
              @for (option of kinds; track option) {
                <mat-option [value]="option">{{ kindLabels[option] }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <div>
          <app-field-label for="article-topic" text="Tema" info="Izaberi temu sa spiska ili počni da kucaš. Ako tvoje teme nema, upiši je i izaberi poslednju stavku „Nova tema”; urednik je pregleda pre objave." />
          <app-select-search
            inputId="article-topic"
            formControlName="topic"
            [options]="topicOptions()"
            emptyLabel="Nije izabrana"
            [allowCustom]="true"
            customLabel="Nova tema"
            customAction="Upiši novu temu"
            customPlaceholder="Upiši naziv nove teme"
          />
        </div>
      </div>
      @if (auth.isEditor() && loaded()?.topic_proposal; as proposal) {
        <div class="notice notice-warn mb-2" role="status">
          <p class="mb-2"><strong>Nova tema čeka odobrenje:</strong> „{{ proposal }}”. Tekst ne može da se objavi dok predlog ne rešiš. Naziv možeš da ispraviš u polju Tema, ili da izabereš postojeću temu i sačuvaš.</p>
          <div class="admin-form-actions">
            <button type="button" mat-flat-button size="sm" [disabled]="busy()" (click)="addTopic()">Dodaj kao novu temu</button>
            <button type="button" mat-stroked-button theme="tertiary" size="sm" [disabled]="busy()" (click)="dropTopic()">Odbaci predlog</button>
          </div>
        </div>
      }

      <app-field-label for="article-title" text="Naslov" [required]="true" />
      <mat-form-field subscriptSizing="dynamic" appearance="outline">
        <input matInput id="article-title" formControlName="title" maxlength="255" />
      </mat-form-field>
      <app-field-label for="article-body" text="Tekst" [required]="true" info="Napiši tekst u Wordu ili bilo gde drugde i nalepi ga ovde. Prazan red pravi novi pasus, a red koji počinje sa „- ” je stavka liste." />
      <mat-form-field subscriptSizing="dynamic" appearance="outline">
        <textarea matInput id="article-body" class="article-paste" formControlName="body" rows="18"></textarea>
      </mat-form-field>
      <app-field-label for="article-summary" text="Uvod" [required]="true" info="Jedna do tri rečenice o čemu je tekst. Prikazuje se na kartici i ispod naslova. Kad nalepiš tekst, AI može da napiše uvod, a ti ga proveriš i ispraviš." />
      <mat-form-field subscriptSizing="dynamic" appearance="outline">
        <textarea matInput id="article-summary" formControlName="summary" rows="3" maxlength="1000"></textarea>
      </mat-form-field>
      <div class="admin-form-actions">
        @if (canEdit()) {
          <button type="button" mat-stroked-button theme="tertiary" size="sm" [disabled]="busy() || summarizing()" (click)="aiSummary()">{{ summarizing() ? 'AI piše uvod…' : 'Napiši uvod (AI)' }}</button>
        }
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
        <app-field-label for="article-debate" text="Stručna debata (nije obavezno)" info="Ispod teksta ide poziv da se o temi razgovara u izabranoj debati." />
        <mat-form-field subscriptSizing="dynamic" appearance="outline">
          <mat-select id="article-debate" formControlName="debate_id">
            <mat-option [value]="null">Nije deo debate</mat-option>
            @for (debate of debates(); track debate.id) {
              <mat-option [value]="debate.id">{{ debate.title }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }

      @if (author(); as writer) {
        <fieldset class="admin-fieldset">
          <legend class="title-with-info">
            Autor
            <app-info-tip label="Odakle su podaci o autoru">Ime, potpis i biografija se uzimaju iz profila autora i prikazuju se uz svaki njegov tekst. Menjaju se na stranici Moj nalog, ne ovde.</app-info-tip>
          </legend>
          <app-author-byline [author]="writer" />
          @if (writer.bio) {
            <p class="small muted article-text">{{ writer.bio }}</p>
          }
          @if (ownText()) {
            @if (!writer.byline) {
              <p class="notice notice-warn" role="status">Pre slanja uredniku upiši potpis (zvanje, specijalnost i mesto) u profilu.</p>
            }
            <a class="inline-link small mb-2" routerLink="/profil">Izmeni potpis i biografiju u profilu →</a>
          }
        </fieldset>
      }

      @if (auth.isEditor()) {
        <fieldset class="admin-fieldset">
          <legend>Pregled urednika</legend>
          <app-field-label for="article-note" text="Napomena autoru" info="Za „Vrati na doradu”: šta autor treba da doradi. Vidi je samo autor, ne i čitaoci." />
          <mat-form-field subscriptSizing="dynamic" appearance="outline">
            <textarea matInput id="article-note" formControlName="note" rows="3"></textarea>
          </mat-form-field>
          <div class="form-row">
            <div>
              <app-field-label for="article-published-at" text="Vreme objave" info="Podrazumevano je sada, pa se tekst objavljuje odmah. Ako upišeš kasniji datum i vreme, objava se zakazuje." />
              <mat-form-field subscriptSizing="dynamic" appearance="outline">
                <input matInput id="article-published-at" formControlName="published_at" type="datetime-local" />
              </mat-form-field>
            </div>
            <div>
              <app-field-label for="article-slug" text="Adresa" info="Adresa (/tekstovi/…) se pravi sama iz naslova i prati naslov dok tekst ne bude objavljen. Posle objave ostaje ista, da podeljeni linkovi ne bi prestali da rade." />
              <mat-form-field subscriptSizing="dynamic" appearance="outline">
                <input matInput id="article-slug" [value]="loaded()?.slug ?? ''" placeholder="Pravi se iz naslova" disabled />
              </mat-form-field>
            </div>
          </div>
          @if (loaded(); as item) {
            <div class="admin-form-actions">
              <button type="button" mat-flat-button [disabled]="busy()" (click)="publish()">{{ scheduled() ? 'Zakaži objavu' : item.status === 'published' ? 'Sačuvaj i objavi' : 'Odobri i objavi' }}</button>
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
  readonly #confirm = inject(ConfirmService);

  protected readonly kindLabels = ARTICLE_KIND_LABELS;
  protected readonly kinds = Object.keys(ARTICLE_KIND_LABELS) as ArticleKind[];
  protected readonly stateOf = articleState;

  protected readonly isEdit = computed(() => !!this.id());
  protected readonly resource = httpResource<AdminArticle>(() => (this.id() ? `${API_URL}/admin/articles/${this.id()}` : undefined));
  protected readonly loaded = computed(() => (this.resource.hasValue() ? this.resource.value() : null));
  protected readonly options = httpResource<ArticleOptions>(() => `${API_URL}/admin/articles/options`);
  readonly #topicStore = inject(ArticleTopicStore).load();
  protected readonly topicOptions = computed(() => this.#topicStore.topics().map((topic) => ({ value: topic.id, label: topic.name })));
  protected readonly debates = computed(() => (this.options.hasValue() ? this.options.value().debates : []));
  protected readonly author = computed<ArticleAuthor | null>(() => {
    const item = this.loaded();
    if (item && !this.ownText()) {
      return item.author;
    }
    return this.options.hasValue() ? this.options.value().profile : null;
  });

  protected readonly ownText = computed(() => !this.loaded() || this.loaded()?.author_id === this.auth.currentUser()?.id);
  protected readonly canEdit = computed(() => !this.loaded() || !!this.loaded()?.can_edit);
  protected readonly canSubmit = computed(() => (this.loaded() ? !!this.loaded()?.can_submit : true));

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly preview = signal(false);
  protected readonly summarizing = signal(false);

  protected readonly form = this.#fb.group({
    kind: ['clanak' as ArticleKind, Validators.required],
    topic: [null as SelectSearchValue<number>],
    title: ['', Validators.required],
    summary: ['', Validators.required],
    body: ['', Validators.required],
    debate_id: [null as number | null],
    note: [''],
    published_at: [localDateTime(new Date())],
  });

  constructor() {
    effect(() => {
      const item = this.loaded();
      if (!item) {
        return;
      }
      this.form.reset({
        kind: item.kind,
        topic: item.topic_id ?? (item.topic_proposal ? { custom: item.topic_proposal } : null),
        title: item.title,
        summary: item.summary,
        body: item.body ?? '',
        debate_id: item.debate_id,
        note: item.editor_note ?? '',
        published_at: localDateTime(item.published_at ? new Date(item.published_at) : new Date()),
      });
      if (item.can_edit) {
        this.form.enable();
      } else {
        this.form.disable();
        this.form.controls.note.enable();
        this.form.controls.published_at.enable();
      }
    });
  }

  protected dateTime(value: string): string {
    return formatDateTime(value);
  }

  protected scheduled(): boolean {
    const at = this.form.controls.published_at.value;
    return !!at && new Date(at).getTime() > Date.now() + 60_000;
  }

  protected addTopic(): void {
    const topic = this.form.controls.topic.value;
    const name = isCustomValue(topic) ? topic.custom.trim() : '';
    if (!name) {
      this.error.set('Upiši naziv nove teme.');
      return;
    }
    this.#resolveTopic({ name }, `Tema „${name}” je dodata i tekst je u njoj.`);
  }

  protected dropTopic(): void {
    this.form.controls.topic.setValue(null);
    this.#resolveTopic({}, 'Predlog teme je odbačen.');
  }

  #resolveTopic(body: { name?: string }, success: string): void {
    this.#run(
      this.#persist().pipe(switchMap((saved) => this.#http.post<AdminArticle>(`${API_URL}/admin/articles/${saved.id}/topic`, body))),
      success,
      true,
      () => this.#topicStore.reload(),
    );
  }

  protected aiSummary(): void {
    if (this.form.controls.body.value.trim().length < 200) {
      this.#notifications.show('Prvo nalepi tekst (bar nekoliko rečenica), pa AI može da napiše uvod.');
      return;
    }
    if (!this.form.controls.summary.value.trim()) {
      this.#requestSummary();
      return;
    }
    this.#confirm
      .confirm({ title: 'Uvod (AI)', message: 'Uvod već postoji. AI će ga zameniti novim predlogom (ništa se ne čuva dok ne sačuvaš tekst).', confirmLabel: 'Zameni', theme: 'primary' })
      .subscribe((confirmed) => confirmed && this.#requestSummary());
  }

  #requestSummary(): void {
    const { title, body } = this.form.getRawValue();
    this.summarizing.set(true);
    this.error.set(null);
    this.#http.post<{ summary: string }>(`${API_URL}/admin/articles/summary`, { title, body }).subscribe({
      next: ({ summary }) => {
        this.summarizing.set(false);
        this.form.controls.summary.setValue(summary);
        this.form.controls.summary.markAsDirty();
        this.#notifications.show('AI je napisao uvod. Pročitaj ga i ispravi ako treba.');
      },
      error: (error) => {
        this.summarizing.set(false);
        this.error.set(apiErrorMessage(error));
      },
    });
  }

  protected save(): void {
    this.#run(this.#persist(), 'Nacrt je sačuvan.');
  }

  protected submit(): void {
    if (!this.author()?.byline) {
      this.error.set('Pre slanja upiši potpis u profilu: zvanje ili specijalnost i mesto.');
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
    if (item && !item.can_edit) {
      return of(item);
    }
    const { note, published_at, topic, ...rest } = this.form.getRawValue();
    const payload = { ...rest, topic_id: typeof topic === 'number' ? topic : null, topic_proposal: isCustomValue(topic) ? topic.custom.trim() || null : null };
    return item ? this.#http.patch<AdminArticle>(`${API_URL}/admin/articles/${item.id}`, payload) : this.#http.post<AdminArticle>(`${API_URL}/admin/articles`, payload);
  }

  #run(request: Observable<AdminArticle>, success: string, needsContent = true, after?: () => void): void {
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
        this.#notifications.show(success);
        after?.();
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

function localDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
