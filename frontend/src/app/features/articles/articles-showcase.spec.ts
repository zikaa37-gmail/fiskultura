import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminArticle, articleState } from './article.model';
import { ArticlesShowcase } from './articles-showcase';

const article = {
  id: 1,
  slug: 'gss-posao',
  kind: 'kolumna',
  title: 'Kako sam postao spasilac u GSS-u',
  summary: 'Obuka, licence i prvi teren.',
  featured: false,
  published_at: '2026-11-20T10:00:00Z',
  topic: { slug: 'gss', name: 'Gorska služba spasavanja (GSS)' },
  author: { name: 'Marko Petrović', byline: 'profesor FV, spasilac GSS, Kopaonik' },
};

describe('ArticlesShowcase', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
  });

  it('shows author name, byline and initials on cards', async () => {
    const fixture = TestBed.createComponent(ArticlesShowcase);
    fixture.componentRef.setInput('limit', 3);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne((req) => req.url.endsWith('/articles/list'));
    expect(request.request.body).toEqual({ per_page: 3 });
    request.flush({ data: [article], meta: { page: 1, per_page: 3, total: 1, last_page: 1 } });
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Kako sam postao spasilac u GSS-u');
    expect(text).toContain('profesor FV, spasilac GSS, Kopaonik');
    expect(fixture.nativeElement.querySelector('.author-avatar').textContent.trim()).toBe('MP');
    expect(text).toContain('Svi tekstovi');
  });

  it('invites colleagues to write when there are no texts yet', async () => {
    const fixture = TestBed.createComponent(ArticlesShowcase);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne((req) => req.url.endsWith('/articles/list'))
      .flush({ data: [], meta: { page: 1, per_page: 4, total: 0, last_page: 1 } });
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Prve priče su u pripremi');
    expect(text).toContain('Želim da pišem');
    expect(text).not.toContain('Svi tekstovi');
  });

  it('labels scheduled and returned texts', () => {
    const base = { ...article, status: 'published', is_visible: false } as unknown as AdminArticle;
    expect(articleState(base).label).toBe('Zakazano');
    expect(articleState({ ...base, is_visible: true }).tone).toBe('ok');
    expect(articleState({ ...base, status: 'returned' }).label).toBe('Vraćeno na doradu');
  });
});
