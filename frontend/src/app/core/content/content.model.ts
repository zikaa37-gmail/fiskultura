export type NewsCategory = 'vest' | 'seminar' | 'takmicenje' | 'propis' | 'konkurs' | 'saopstenje' | 'ostalo';

export type SourceType = 'sajt' | 'facebook' | 'instagram' | 'youtube' | 'mediji' | 'ostalo';

export type OrganizationType = 'strukovno-udruzenje' | 'skolski-sport' | 'institucija' | 'fakultet' | 'sindikat' | 'ostalo';

export type OrganizationLevel = 'republički' | 'pokrajinski' | 'okružni' | 'gradski' | 'opštinski';

export interface OrganizationRef {
  slug: string;
  name: string;
  short_name: string | null;
}

export interface NewsItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  category: NewsCategory;
  featured: boolean;
  cover_image: string | null;
  published_at: string | null;
  source: { url: string | null; type: SourceType | null; published_at: string | null };
  organization: OrganizationRef | null;
}

export interface NewsDetail extends NewsItem {
  body: string | null;
  related: NewsItem[];
}

export interface NewsPage {
  data: NewsItem[];
  meta: { page: number; per_page: number; total: number; last_page: number };
}

export interface Organization extends OrganizationRef {
  id: number;
  type: OrganizationType;
  level: OrganizationLevel;
  city: string | null;
  website: string | null;
  social: { facebook?: string; instagram?: string; youtube?: string };
  email: string | null;
  description: string | null;
  status: 'aktivno' | 'neaktivno' | 'nepoznato';
  last_activity: string | null;
  parent: OrganizationRef | null;
  member_source: string | null;
  link_status: Partial<Record<LinkField, LinkStatus>>;
  news_count: number | null;
}

export type LinkField = 'website' | 'facebook' | 'instagram' | 'youtube' | 'member_source';

export type LinkStatus = 'ok' | 'broken' | 'unknown';

export interface OrganizationDetail extends Organization {
  members: (OrganizationRef & { city: string | null })[];
  news: NewsItem[];
}

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  vest: 'Vesti',
  seminar: 'Stručni skupovi',
  takmicenje: 'Takmičenja',
  saopstenje: 'Saopštenja',
  propis: 'Propisi',
  konkurs: 'Konkursi',
  ostalo: 'Ostalo',
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  sajt: 'sajt organizacije',
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  mediji: 'mediji',
  ostalo: 'drugi izvor',
};

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  'strukovno-udruzenje': 'Strukovno udruženje',
  'skolski-sport': 'Školski sport',
  institucija: 'Institucija',
  fakultet: 'Fakultet',
  sindikat: 'Sindikat',
  ostalo: 'Ostalo',
};

export const ORGANIZATION_LEVEL_LABELS: Record<OrganizationLevel, string> = {
  republički: 'Republički',
  pokrajinski: 'Pokrajinski',
  okružni: 'Okružni',
  gradski: 'Gradski',
  opštinski: 'Opštinski',
};

export function formatDate(value: string | null): string {
  if (!value) {
    return '';
  }
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${Number(day)}. ${Number(month)}. ${year}.`;
}

export function organizationLabel(organization: OrganizationRef | null): string {
  return organization ? (organization.short_name ?? organization.name) : '';
}
