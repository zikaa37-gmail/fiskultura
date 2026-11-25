export type SuggestionStatus = 'new' | 'accepted' | 'dismissed';
export type SuggestionOrigin = 'feed' | 'form';
export type FeedSourceType = 'sajt' | 'rss' | 'facebook' | 'instagram' | 'youtube';
export type SourceMode = 'auto' | 'manual';
export type SourceCheckStatus = 'ok' | 'no_feed' | 'blocked' | 'error';

export interface NewsSuggestion {
  id: number;
  origin: SuggestionOrigin;
  status: SuggestionStatus;
  title: string;
  url: string | null;
  excerpt: string | null;
  published_on: string | null;
  created_at: string | null;
  organization: { id: number; slug: string; name: string } | null;
  source_type: FeedSourceType | null;
  sender: { name: string; email: string; organization: string | null } | null;
  news: { id: number; title: string; status: string } | null;
  reviewer: string | null;
  reviewed_at: string | null;
  host: string | null;
}

export interface SuggestionPage {
  data: NewsSuggestion[];
  meta: { page: number; per_page: number; total: number; last_page: number };
  counts: Partial<Record<SuggestionStatus, number>>;
}

export interface OrganizationSource {
  id: number;
  organization: { id: number; slug: string; name: string };
  type: FeedSourceType;
  url: string;
  feed_url: string | null;
  mode: SourceMode;
  last_checked_at: string | null;
  last_status: SourceCheckStatus | null;
  last_error: string | null;
  last_found: number;
}

export const SUGGESTION_STATUS_LABELS: Record<SuggestionStatus, string> = {
  new: 'Čeka pregled',
  accepted: 'Napravljena vest',
  dismissed: 'Odbačeno',
};

export const SUGGESTION_ORIGIN_LABELS: Record<SuggestionOrigin, string> = {
  feed: 'Iz izvora',
  form: 'Poslato preko forme',
};

export const FEED_SOURCE_TYPE_LABELS: Record<FeedSourceType, string> = {
  sajt: 'Sajt',
  rss: 'RSS fid',
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
};

export const SOURCE_MODE_LABELS: Record<SourceMode, string> = {
  auto: 'Automatski',
  manual: 'Ručno',
};

export const SOURCE_STATUS_LABELS: Record<SourceCheckStatus, string> = {
  ok: 'Fid radi',
  no_feed: 'Nema fida',
  blocked: 'Zabranjeno (robots.txt)',
  error: 'Greška',
};

export const MANUAL_ONLY: FeedSourceType[] = ['facebook', 'instagram'];
