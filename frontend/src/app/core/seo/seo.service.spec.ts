import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let seo: SeoService;
  let document: Document;

  const meta = (selector: string) => document.head.querySelector(`meta[${selector}]`)?.getAttribute('content');

  beforeEach(() => {
    seo = TestBed.inject(SeoService);
    document = TestBed.inject(DOCUMENT);
  });

  it('postavlja naslov, opis, canonical, Open Graph i JSON-LD', () => {
    seo.set({
      title: 'Koliko ocena?',
      description: 'Najmanje četiri ocene u polugodištu.',
      path: '/pitanja/koliko-ocena?oblast=x',
      type: 'article',
      jsonLd: { '@type': 'QAPage', name: '</script>' },
    });

    expect(document.title).toBe('Koliko ocena? — Fiskultura');
    expect(meta('name="description"')).toBe('Najmanje četiri ocene u polugodištu.');
    expect(meta('property="og:url"')).toBe('https://fiskultura.rs/pitanja/koliko-ocena');
    expect(meta('property="og:type"')).toBe('article');
    expect(meta('property="og:image"')).toBe('https://fiskultura.rs/og-image.png');
    expect(meta('name="robots"')).toContain('index, follow');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://fiskultura.rs/pitanja/koliko-ocena');
    const jsonLd = document.head.querySelector('#seo-json-ld')?.textContent ?? '';
    expect(JSON.parse(jsonLd)['@type']).toBe('QAPage');
    expect(jsonLd).not.toContain('</script>');
  });

  it('skraćuje dugačak opis, a stranicu sa noindex skida iz kanonskih', () => {
    seo.set({ title: 'Prvo', path: '/prvo', jsonLd: { '@type': 'Thing' } });
    seo.set({ title: 'Prijava', description: 'reč '.repeat(80), path: '/prijava', noindex: true });

    expect(meta('name="description"')!.length).toBeLessThanOrEqual(160);
    expect(meta('name="robots"')).toBe('noindex, nofollow');
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelector('#seo-json-ld')).toBeNull();
  });
});
