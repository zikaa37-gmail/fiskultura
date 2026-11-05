import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot } from '@angular/router';

export const SITE_URL = 'https://fiskultura.rs';
export const SITE_NAME = 'Fiskultura';
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_DESCRIPTION =
  'Fiskultura je portal za nastavnike fizičkog vaspitanja u Srbiji: vesti iz školskog sporta, strukovna udruženja, propisi, pitanja i odgovori, pravila sportova i aplikacije za nastavu.';

export type JsonLd = Record<string, unknown>;

export interface RouteSeo {
  description?: string;
  noindex?: boolean;
  jsonLd?: JsonLd | JsonLd[];
}

export interface PageSeo extends RouteSeo {
  title: string;
  path?: string;
  image?: string | null;
  type?: 'website' | 'article';
  publishedTime?: string | null;
  modifiedTime?: string | null;
}

const JSON_LD_ID = 'seo-json-ld';

@Injectable({ providedIn: 'root' })
export class SeoService {
  readonly #title = inject(Title);
  readonly #meta = inject(Meta);
  readonly #document = inject(DOCUMENT);
  #currentPath = '/';

  applyRoute(snapshot: ActivatedRouteSnapshot, url: string): void {
    this.#currentPath = url;
    let route: ActivatedRouteSnapshot | null = snapshot;
    let seo: RouteSeo = {};
    let noindex = false;
    let deepest = snapshot;
    while (route) {
      const own = (route.routeConfig?.data?.['seo'] ?? {}) as RouteSeo;
      noindex ||= !!own.noindex;
      seo = { ...seo, ...own };
      deepest = route;
      route = route.firstChild;
    }
    if (deepest.data['dynamicSeo']) {
      return;
    }
    const title = typeof deepest.title === 'string' ? deepest.title : SITE_NAME;
    this.set({ title, ...seo, noindex });
  }

  set(page: PageSeo): void {
    const title = page.title.includes(SITE_NAME) ? page.title : `${page.title} — ${SITE_NAME}`;
    const description = this.#clip(page.description ?? DEFAULT_DESCRIPTION);
    const url = SITE_URL + this.#path(page.path);
    const image = page.image || DEFAULT_IMAGE;

    this.#title.setTitle(title);
    this.#name('description', description);
    this.#name('robots', page.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    this.#property('og:site_name', SITE_NAME);
    this.#property('og:locale', 'sr_RS');
    this.#property('og:type', page.type ?? 'website');
    this.#property('og:title', title);
    this.#property('og:description', description);
    this.#property('og:url', url);
    this.#property('og:image', image);
    this.#property('og:image:alt', page.image ? title : 'Fiskultura — portal za fizičko vaspitanje i školski sport');
    this.#optionalProperty('og:image:width', page.image ? null : '1200');
    this.#optionalProperty('og:image:height', page.image ? null : '630');
    this.#name('twitter:card', 'summary_large_image');
    this.#name('twitter:title', title);
    this.#name('twitter:description', description);
    this.#name('twitter:image', image);
    this.#optionalProperty('article:published_time', page.type === 'article' ? page.publishedTime : null);
    this.#optionalProperty('article:modified_time', page.type === 'article' ? page.modifiedTime : null);
    this.#canonical(page.noindex ? null : url);
    this.#jsonLd(page.jsonLd);
  }

  #path(path?: string): string {
    const value = path ?? this.#currentPath;
    const clean = value.split(/[?#]/)[0] || '/';
    return clean === '/' ? '/' : clean.replace(/\/$/, '');
  }

  #clip(text: string): string {
    const plain = text.replace(/\s+/g, ' ').trim();
    return plain.length > 160 ? `${plain.slice(0, 157).replace(/\s+\S*$/, '')}…` : plain;
  }

  #name(name: string, content: string): void {
    this.#meta.updateTag({ name, content }, `name="${name}"`);
  }

  #property(property: string, content: string): void {
    this.#meta.updateTag({ property, content }, `property="${property}"`);
  }

  #optionalProperty(property: string, content: string | null | undefined): void {
    if (content) {
      this.#property(property, content);
    } else {
      this.#meta.removeTag(`property="${property}"`);
    }
  }

  #canonical(url: string | null): void {
    const head = this.#document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.#document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  #jsonLd(data: JsonLd | JsonLd[] | undefined): void {
    const head = this.#document.head;
    head.querySelector(`#${JSON_LD_ID}`)?.remove();
    if (!data) {
      return;
    }
    const script = this.#document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', JSON_LD_ID);
    script.textContent = JSON.stringify(Array.isArray(data) ? { '@context': 'https://schema.org', '@graph': data } : { '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c');
    head.appendChild(script);
  }
}

export const SITE_ORGANIZATION: JsonLd = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.svg`,
  description: DEFAULT_DESCRIPTION,
};

export const SITE_WEBSITE: JsonLd = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  inLanguage: 'sr-Latn',
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export function breadcrumbs(items: { name: string; path: string }[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: SITE_URL + item.path,
    })),
  };
}
