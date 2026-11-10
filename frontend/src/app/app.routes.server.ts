import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { SERVER_USER_AGENT } from './core/http/api-origin.interceptor';
import { OUTCOME_GRADES } from './content/outcomes/outcomes';
import { RULE_TOPICS } from './content/rules/rule-topics';

interface SeoRoutes {
  news: { slug: string }[];
  organizations: { slug: string }[];
  questions: { slug: string }[];
}

let seoRoutes: Promise<SeoRoutes> | null = null;

function loadSeoRoutes(): Promise<SeoRoutes> {
  const origin = (process.env['SSR_API_ORIGIN'] || 'https://fiskultura.rs').replace(/\/$/, '');
  seoRoutes ??= fetch(`${origin}/api/seo/routes`, { headers: { 'User-Agent': SERVER_USER_AGENT, Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json() as Promise<SeoRoutes>;
    })
    .catch((error: unknown) => {
      console.warn(`Prerender bez stranica vesti, udruženja i pitanja: ${origin}/api/seo/routes nije dostupan (${error}).`);
      return { news: [], organizations: [], questions: [] };
    });
  return seoRoutes;
}

const slugs = (kind: keyof SeoRoutes) => async () => (await loadSeoRoutes())[kind].map(({ slug }) => ({ slug }));

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'vesti', renderMode: RenderMode.Prerender },
  { path: 'vesti/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: slugs('news'), fallback: PrerenderFallback.Client },
  { path: 'udruzenja', renderMode: RenderMode.Prerender },
  { path: 'udruzenja/osnivanje', renderMode: RenderMode.Prerender },
  { path: 'udruzenja/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: slugs('organizations'), fallback: PrerenderFallback.Client },
  { path: 'propisi', renderMode: RenderMode.Prerender },
  { path: 'propisi/:tema', renderMode: RenderMode.Prerender, getPrerenderParams: async () => RULE_TOPICS.map((topic) => ({ tema: topic.slug })) },
  { path: 'kontakt', renderMode: RenderMode.Prerender },
  { path: 'pitanja', renderMode: RenderMode.Prerender },
  { path: 'pitanja/:slug', renderMode: RenderMode.Prerender, getPrerenderParams: slugs('questions'), fallback: PrerenderFallback.Client },
  { path: 'sportovi', renderMode: RenderMode.Prerender },
  { path: 'sportovi/kosarka', renderMode: RenderMode.Prerender },
  { path: 'sportovi/odbojka', renderMode: RenderMode.Prerender },
  { path: 'sportovi/rukomet', renderMode: RenderMode.Prerender },
  { path: 'sportovi/mali-fudbal', renderMode: RenderMode.Prerender },
  { path: 'sportovi/jadzent', renderMode: RenderMode.Prerender },
  { path: 'sportovi/testiranje', renderMode: RenderMode.Prerender },
  { path: 'sportovi/kros', renderMode: RenderMode.Prerender },
  { path: 'sportovi/atletika', renderMode: RenderMode.Prerender },
  { path: 'sportovi/gimnastika', renderMode: RenderMode.Prerender },
  { path: 'sportovi/elementarne-igre', renderMode: RenderMode.Prerender },
  { path: 'sportovi/vezbe-sa-rekvizitima', renderMode: RenderMode.Prerender },
  { path: 'sportovi/plesovi', renderMode: RenderMode.Prerender },
  { path: 'literatura', renderMode: RenderMode.Prerender },
  { path: 'ishodi', renderMode: RenderMode.Prerender },
  { path: 'ishodi/:razred', renderMode: RenderMode.Prerender, getPrerenderParams: async () => OUTCOME_GRADES.map((grade) => ({ razred: grade.slug })) },
  { path: 'aplikacije', renderMode: RenderMode.Prerender },
  { path: 'novi-nastavnici', renderMode: RenderMode.Prerender },
  { path: 'obavestenja', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
