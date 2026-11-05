import { SPORTS } from '../../content/sports-content';
import { RULE_DOCUMENT_GROUPS as ATHLETICS } from '../sports/athletics/rules-content';
import { PHOTO_CREDITS_NOTE, RULE_DOCUMENT_GROUPS as BASKETBALL } from '../sports/basketball/rules-content';
import { RULE_DOCUMENT_GROUPS as DANCES } from '../sports/dances/rules-content';
import { RULE_DOCUMENT_GROUPS as ELEMENTARY } from '../sports/elementary-games/rules-content';
import { RULE_DOCUMENT_GROUPS as FUTSAL } from '../sports/futsal/rules-content';
import { RULE_DOCUMENT_GROUPS as GYMNASTICS } from '../sports/gymnastics/rules-content';
import { RULE_DOCUMENT_GROUPS as HANDBALL } from '../sports/handball/rules-content';
import { RULE_DOCUMENT_GROUPS as JADZENT } from '../sports/jadzent/rules-content';
import { RULE_DOCUMENT_GROUPS as PROPS } from '../sports/props/rules-content';
import { RULE_DOCUMENT_GROUPS as VOLLEYBALL } from '../sports/volleyball/rules-content';
import { BATTERIES, REFERENCE_TABLES, TESTING_SOURCES } from '../testing/testing-content';
import { CROSS_SECTIONS } from '../cross/cross-content';
import photoCredits from '../../../../public/slike/kosarka/photos/credits.json';

export interface LiteratureItem {
  title: string;
  note: string;
  url: string;
  badge: string;
}

export interface LiteratureGroup {
  id: string;
  title: string;
  page: string | null;
  note?: string;
  items: LiteratureItem[];
}

interface DocumentGroup {
  documents: { title: string; note: string; url: string; language: string; format: string }[];
}

interface Source {
  title: string;
  url: string;
  publisher?: string;
  year?: string;
  pages?: string;
}

const LANGUAGE: Record<string, string> = { sr: 'srpski', en: 'engleski' };

function fromDocuments(groups: DocumentGroup[]): LiteratureItem[] {
  return groups.flatMap((group) =>
    group.documents.map((doc) => ({ title: doc.title, note: doc.note, url: doc.url, badge: [doc.format, LANGUAGE[doc.language] ?? doc.language].filter(Boolean).join(' · ') })),
  );
}

function collectSources(value: unknown, found: Source[] = []): Source[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectSources(item, found));
  } else if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record['title'] === 'string' && typeof record['url'] === 'string' && /^https?:\/\//.test(record['url'])) {
      found.push(record as unknown as Source);
    }
    Object.values(record).forEach((item) => collectSources(item, found));
  }
  return found;
}

function fromSources(sources: Source[]): LiteratureItem[] {
  const seen = new Set<string>();
  return sources
    .filter((source) => !source.title.includes('; '))
    .filter((source) => (seen.has(source.url) ? false : (seen.add(source.url), true)))
    .map((source) => ({
      title: source.title,
      note: [source.publisher, source.year].filter(Boolean).join(', '),
      url: source.url,
      badge: /\.pdf($|\?)/i.test(source.url) ? 'PDF' : 'sajt',
    }));
}

function unique(items: LiteratureItem[]): LiteratureItem[] {
  const seen = new Set<string>();
  return items.filter((item) => (seen.has(item.url) ? false : (seen.add(item.url), true)));
}

const SPORT_DOCUMENTS: [string, DocumentGroup[]][] = [
  ['kosarka', BASKETBALL],
  ['odbojka', VOLLEYBALL],
  ['rukomet', HANDBALL],
  ['mali-fudbal', FUTSAL],
  ['jadzent', JADZENT],
  ['atletika', ATHLETICS],
  ['gimnastika', GYMNASTICS],
  ['elementarne-igre', ELEMENTARY],
  ['vezbe-sa-rekvizitima', PROPS],
  ['plesovi', DANCES],
];

const PHOTO_ITEMS: LiteratureItem[] = Object.entries(photoCredits as Record<string, { author: string; license: string; source: string }>).map(([name, credit]) => ({
  title: `Fotografija „${name}“`,
  note: `${credit.author}, ${credit.license}`,
  url: credit.source,
  badge: 'fotografija',
}));

export const LITERATURE_GROUPS: LiteratureGroup[] = [
  ...SPORT_DOCUMENTS.map(([slug, groups]) => {
    const sport = SPORTS.find((item) => item.slug === slug);
    return { id: slug, title: sport?.name ?? slug, page: sport?.rulesPage ?? null, items: unique(fromDocuments(groups)) };
  }),
  { id: 'kros', title: 'Školski kros', page: '/sportovi/kros', items: fromSources(collectSources(CROSS_SECTIONS)) },
  { id: 'testiranje', title: 'Testiranje fizičkih sposobnosti', page: '/sportovi/testiranje', items: fromSources([...TESTING_SOURCES, ...collectSources(BATTERIES), ...collectSources(REFERENCE_TABLES)]) },
  { id: 'fotografije', title: 'Fotografije i sudijski znaci', page: '/sportovi/kosarka', note: PHOTO_CREDITS_NOTE, items: PHOTO_ITEMS },
];
