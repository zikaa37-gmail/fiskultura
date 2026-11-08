export type UserRole = 'user' | 'author' | 'editor' | 'admin';

export type MemberStatus = 'nastavnik-os' | 'nastavnik-ss' | 'pripravnik' | 'student' | 'penzija' | 'drugo';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  member_status: MemberStatus | null;
  school: string | null;
  municipality: string | null;
  district: string | null;
  directory_consent: boolean;
  surveys_consent: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface ProfilePayload {
  name: string;
  member_status: MemberStatus | null;
  school: string | null;
  municipality: string | null;
  district: string | null;
  directory_consent?: boolean;
  surveys_consent?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  member_status: MemberStatus | null;
  source: string | null;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Korisnik',
  author: 'Autor',
  editor: 'Urednik',
  admin: 'Administrator',
};

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  'nastavnik-os': 'Nastavnik u osnovnoj školi',
  'nastavnik-ss': 'Nastavnik u srednjoj školi',
  pripravnik: 'Pripravnik',
  student: 'Student',
  penzija: 'U penziji',
  drugo: 'Drugo (trener, učitelj, roditelj…)',
};

export const MEMBER_STATUSES = Object.keys(MEMBER_STATUS_LABELS) as MemberStatus[];
