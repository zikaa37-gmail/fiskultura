import { IconName } from '../../shared/icon/icon';

export type DebateStatus = 'proposed' | 'open' | 'closed' | 'rejected';
export type PostKind = 'question' | 'criticism' | 'statement' | 'suggestion';
export type Support = 'jaka' | 'srednja' | 'slaba';

export interface Debate {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  status: DebateStatus;
  moderator: { id: number; name: string } | null;
  posts_count: number;
  last_post_at: string | null;
  has_summary: boolean;
  created_at: string | null;
  closed_at: string | null;
}

export interface DebatePromotion {
  id: number;
  message: string;
  recipients: number;
  sent: number;
  failed: number;
  finished: boolean;
  created_at: string | null;
}

export interface AdminDebate extends Debate {
  creator: { id: number; name: string } | null;
  summary_pending: boolean;
  last_promotion: DebatePromotion | null;
}

export interface DebateSummary {
  overview: string;
  positions: { title: string; summary: string; support: Support; post_ids: number[] }[];
  conclusions: string[];
  open_questions: string[];
  best_posts: { post_id: number; reason: string; kind: PostKind; excerpt: string; author: string; likes_count: number }[];
  suggestions: { text: string; post_ids: number[] }[];
  generated_at: string | null;
  posts_analyzed: number | null;
}

export interface ReopenRequest {
  id: number;
  kind: PostKind;
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  author: string;
  decision_note: string | null;
  created_at: string | null;
  decided_at: string | null;
}

export interface DebateIntro {
  text: string;
  notes?: string | null;
  sources: { title: string; url: string }[];
  at: string | null;
}

export type IntroStatus = 'pending' | 'generating' | 'draft' | 'approved' | 'failed';

export interface DebateDetail extends Debate {
  can_moderate: boolean;
  summary: DebateSummary | null;
  intro: DebateIntro | null;
  intro_status?: IntroStatus | null;
  intro_guidance?: string | null;
  intro_error?: string | null;
  intro_busy?: boolean;
  intro_draft?: DebateIntro | null;
  my_reopen_request: ReopenRequest | null;
  summary_draft?: DebateSummary | null;
  summary_guidance?: string | null;
  reopen_requests?: ReopenRequest[];
}

export interface DebatePost {
  id: number;
  kind: PostKind;
  body: string;
  likes_count: number;
  liked: boolean;
  highlighted: boolean;
  author: string;
  mine: boolean;
  created_at: string | null;
  hidden?: boolean;
}

export const DEBATE_STATUS_LABELS: Record<DebateStatus, string> = {
  proposed: 'čeka odobrenje',
  open: 'otvorena',
  closed: 'zatvorena',
  rejected: 'odbijena',
};

export const POST_KIND_LABELS: Record<PostKind, string> = {
  question: 'Pitanje',
  criticism: 'Kritika',
  statement: 'Konstatacija',
  suggestion: 'Predlog',
};

export const POST_KIND_ICONS: Record<PostKind, IconName> = {
  question: 'help',
  criticism: 'ban',
  statement: 'check',
  suggestion: 'star',
};

export const SUPPORT_LABELS: Record<Support, string> = {
  jaka: 'jaka podrška',
  srednja: 'srednja podrška',
  slaba: 'slaba podrška',
};
