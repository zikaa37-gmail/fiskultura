export type ArticleKind = 'kolumna' | 'clanak';

export type ArticleStatus = 'draft' | 'submitted' | 'returned' | 'published';

export const ARTICLE_KIND_LABELS: Record<ArticleKind, string> = {
  kolumna: 'Kolumna',
  clanak: 'Članak',
};

export const ARTICLE_STATUS_LABELS: Record<ArticleStatus | 'scheduled', string> = {
  draft: 'Nacrt',
  submitted: 'Čeka pregled',
  returned: 'Vraćeno na doradu',
  published: 'Objavljeno',
  scheduled: 'Zakazano',
};

export interface Topic {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  sort: number;
  articles_count?: number;
}

export interface ArticleAuthor {
  name: string | null;
  byline: string | null;
  bio?: string | null;
}

export interface ArticleItem {
  id: number;
  slug: string;
  kind: ArticleKind;
  title: string;
  summary: string;
  featured: boolean;
  published_at: string | null;
  topic: { slug: string; name: string } | null;
  author: ArticleAuthor;
}

export interface ArticleDetail extends ArticleItem {
  body: string;
  debate: { slug: string; title: string } | null;
  related: ArticleItem[];
}

export interface ArticlePage {
  data: ArticleItem[];
  meta: { page: number; per_page: number; total: number; last_page: number };
}

export interface AdminArticle extends ArticleItem {
  body?: string;
  topic_id: number | null;
  topic_proposal: string | null;
  debate_id: number | null;
  status: ArticleStatus;
  is_visible: boolean;
  editor_note: string | null;
  submitted_at: string | null;
  updated_at: string | null;
  author_id: number;
  can_edit: boolean;
  can_submit: boolean;
}

export interface AdminArticlePage extends ArticlePage {
  data: AdminArticle[];
  submitted: number;
}

export interface AuthorProfile {
  name: string;
  byline: string | null;
  bio: string | null;
}

export interface ArticleOptions {
  debates: { id: number; title: string }[];
  profile: AuthorProfile;
}

export interface ArticleState {
  label: string;
  tone: 'ok' | 'muted' | 'warn';
}

export function articleState(item: AdminArticle): ArticleState {
  if (item.status === 'published') {
    return item.is_visible ? { label: ARTICLE_STATUS_LABELS.published, tone: 'ok' } : { label: ARTICLE_STATUS_LABELS.scheduled, tone: 'muted' };
  }
  return { label: ARTICLE_STATUS_LABELS[item.status], tone: item.status === 'draft' ? 'muted' : 'warn' };
}
