import { MemberStatus, UserRole } from '../../core/auth/user.model';
import { LinkField, NewsCategory, Organization, OrganizationRef, SourceType } from '../../core/content/content.model';

export type NewsStatus = 'draft' | 'published';

export interface AdminNews {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string | null;
  category: NewsCategory;
  organization_id: number | null;
  organization: OrganizationRef | null;
  source_url: string | null;
  source_type: SourceType | null;
  source_published_at: string | null;
  status: NewsStatus;
  is_visible: boolean;
  published_at: string | null;
  featured: boolean;
  author: string | null;
  updated_at: string | null;
}

export interface AdminNewsPayload {
  title: string;
  slug: string | null;
  summary: string;
  body: string | null;
  category: NewsCategory;
  organization_id: number | null;
  source_url: string | null;
  source_type: SourceType | null;
  source_published_at: string | null;
  status: NewsStatus;
  published_at: string | null;
  featured: boolean;
}

export interface AdminOrganization extends Organization {
  parent_id: number | null;
  broken_links: LinkField[];
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  member_status: MemberStatus | null;
  school: string | null;
  municipality: string | null;
  district: string | null;
  source: string | null;
  verified: boolean;
  blocked: boolean;
  created_at: string | null;
  last_active_at: string | null;
}

export interface MemberCount {
  value: string | null;
  total: number;
}

export interface MemberStats {
  total: number;
  unverified: number;
  new_7_days: number;
  new_30_days: number;
  active_30_days: number;
  in_directory: number;
  surveys_consent: number;
  by_status: MemberCount[];
  by_district: MemberCount[];
  by_source: MemberCount[];
}

export interface Page<T> {
  data: T[];
  meta: { page: number; per_page: number; total: number; last_page: number };
}

export function newsState(news: AdminNews): { label: string; tone: 'ok' | 'muted' | 'warn' } {
  if (news.status === 'draft') {
    return { label: 'Nacrt', tone: 'muted' };
  }
  return news.is_visible ? { label: 'Objavljeno', tone: 'ok' } : { label: 'Zakazano', tone: 'warn' };
}

export function toLocalInput(value: string | null): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
