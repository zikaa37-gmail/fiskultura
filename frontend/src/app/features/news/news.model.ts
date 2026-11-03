export type NewsCategory = 'vest' | 'seminar' | 'takmicenje' | 'propis' | 'konkurs' | 'saopstenje' | 'ostalo';

export interface OrganizationPost {
  organization: string;
  date: string | null;
  title: string;
  category: NewsCategory;
  url: string;
  summary: string;
  verified: boolean;
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
