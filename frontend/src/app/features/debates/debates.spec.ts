import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { DebateDetail } from './debate-detail';
import { Debates } from './debates';

const debate = {
  id: 1,
  slug: 'norma-i-sekcije',
  title: 'Da li sekcije treba da ulaze u normu?',
  description: 'Razgovor o sekcijama.',
  status: 'open',
  moderator: { id: 2, name: 'Urednik' },
  posts_count: 1,
  last_post_at: '2026-11-10T10:00:00Z',
  has_summary: true,
  created_at: '2026-11-01T10:00:00Z',
  closed_at: null,
};

const post = { id: 7, kind: 'suggestion', body: 'Dva časa za sekciju.', likes_count: 2, liked: false, reaction: null, reactions: { agree: 2 }, highlighted: true, author: 'Ana', mine: false, created_at: '2026-11-10T10:00:00Z' };

describe('Debate', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('lista šalje filtere iz adrese i prikazuje predloge koji čekaju odobrenje', async () => {
    await TestBed.inject(Router).navigateByUrl('/?status=open&pretraga=norma');
    const fixture = TestBed.createComponent(Debates);
    fixture.detectChanges();

    http.expectOne('/api/debates?status=open&q=norma').flush({
      data: [debate],
      proposals: [{ ...debate, id: 2, slug: 'oprema', title: 'Oprema u seoskim školama', status: 'proposed' }],
    });
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Da li sekcije treba da ulaze u normu?');
    expect(text).toContain('Tvoji predlozi tema');
    expect(text).toContain('čeka odobrenje');
    expect(text).toContain('Predloži temu za razgovor');
    expect(text).not.toContain('Postavi pitanje');
  });

  it('tema prikazuje sažetak, lajk menja broj bez novog učitavanja, a „Hoću da kažem” šalje prilog', async () => {
    const fixture = TestBed.createComponent(DebateDetail);
    fixture.componentRef.setInput('slug', 'norma-i-sekcije');
    fixture.detectChanges();

    http.expectOne('/api/debates/norma-i-sekcije').flush({
      ...debate,
      can_moderate: false,
      my_ban: null,
      summary: {
        overview: 'Većina traži da se sekcije priznaju.',
        positions: [{ title: 'Priznati sekcije', summary: 'Dva časa.', support: 'jaka', post_ids: [7] }],
        conclusions: ['Sekcije u normu.'],
        open_questions: [],
        best_posts: [{ post_id: 7, reason: 'Konkretan predlog.', kind: 'suggestion', excerpt: 'Dva časa za sekciju.', author: 'Ana', likes_count: 2 }],
        suggestions: [],
        generated_at: '2026-11-10T12:00:00Z',
        posts_analyzed: 1,
      },
    });
    http.expectOne('/api/debates/norma-i-sekcije/posts?sort=new&page=1').flush({ data: [post], meta: { current_page: 1, last_page: 1, total: 1 } });
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Većina traži da se sekcije priznaju.');
    expect(element.textContent).toContain('jaka podrška');
    expect(element.querySelector('app-debate-moderation')).toBeNull();

    const agree = element.querySelector('.reaction[title="Slažem se"]') as HTMLButtonElement;
    expect(agree.textContent).toContain('2');
    agree.click();
    const reaction = http.expectOne('/api/debate-posts/7/react');
    expect(reaction.request.body).toEqual({ type: 'agree' });
    reaction.flush({ reaction: 'agree', liked: true, likes_count: 3, reactions: { agree: 3 } });
    await fixture.whenStable();
    expect(element.querySelector('.reaction[title="Slažem se"] .reaction-count')?.textContent?.trim()).toBe('3');
    expect(element.querySelector('.reaction[title="Slažem se"]')?.getAttribute('aria-pressed')).toBe('true');

    (element.querySelector('.say-button') as HTMLButtonElement).click();
    await fixture.whenStable();
    const page = fixture.componentInstance as unknown as { draftBody: { set(value: string): void }; draftKind: { set(value: string): void }; send(): void };
    page.draftKind.set('question');
    page.draftBody.set('Kako to izgleda u srednjoj školi?');
    page.send();
    const request = http.expectOne('/api/debates/norma-i-sekcije/posts');
    expect(request.request.body).toEqual({ kind: 'question', body: 'Kako to izgleda u srednjoj školi?' });
    request.flush({ ...post, id: 8, kind: 'question', body: 'Kako to izgleda u srednjoj školi?', mine: true });
    TestBed.tick();
    http.expectOne('/api/debates/norma-i-sekcije').flush({ ...debate, posts_count: 2, can_moderate: false, summary: null });
    http.expectOne('/api/debates/norma-i-sekcije/posts?sort=new&page=1').flush({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } });
  });
});
