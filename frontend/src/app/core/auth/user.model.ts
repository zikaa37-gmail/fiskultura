export type UserRole = 'user' | 'author' | 'editor' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  school: string | null;
  municipality: string | null;
  district: string | null;
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
  school: string | null;
  municipality: string | null;
  district: string | null;
}

export interface RegisterPayload extends ProfilePayload {
  email: string;
  password: string;
  password_confirmation: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Korisnik',
  author: 'Autor',
  editor: 'Urednik',
  admin: 'Administrator',
};
