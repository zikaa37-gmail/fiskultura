import { SocialKind } from './social-card';

export type SocialSource = 'news' | 'debate' | 'question';
export type SocialNetwork = 'instagram' | 'facebook';
export type SocialStatus = 'scheduled' | 'publishing' | 'published' | 'failed';

export interface SocialAccountState {
  connected: boolean;
  username: string | null;
  token_expires_at: string | null;
  via_facebook?: boolean;
}

export interface SocialState extends SocialAccountState {
  facebook: SocialAccountState & { page_id: string };
  oauth: { instagram: boolean; facebook: boolean };
}

export interface SocialPost {
  id: number;
  kind: SocialKind;
  caption: string | null;
  networks: SocialNetwork[];
  status: SocialStatus;
  facebook_status: SocialStatus | null;
  facebook_permalink: string | null;
  facebook_error: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  permalink: string | null;
  error: string | null;
  source_type: SocialSource | null;
  source_id: number | null;
  author: string | null;
  image_url: string | null;
}

export interface SocialShareData {
  title: string;
  label?: string;
  caption: string;
  url: string;
  sourceType?: SocialSource;
  sourceId?: number;
}

export const SOCIAL_STATUS_LABELS: Record<SocialStatus, string> = {
  scheduled: 'Zakazano',
  publishing: 'Objavljuje se',
  published: 'Objavljeno',
  failed: 'Nije uspelo',
};

export function shareCaption(title: string, text: string | null | undefined, url: string): string {
  const body = (text ?? '').trim();
  const short = body.length > 600 ? `${body.slice(0, 600).replace(/\s+\S*$/, '')}…` : body;
  return [title.trim(), short, `Više: ${url}`, '#fiskultura #fizičkovaspitanje'].filter(Boolean).join('\n\n');
}
