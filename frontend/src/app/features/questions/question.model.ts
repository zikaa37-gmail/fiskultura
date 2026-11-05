export type QuestionCategory = 'norma' | 'ocenjivanje' | 'oslobadjanje' | 'bezbednost' | 'takmicenja' | 'zdravitas' | 'es-dnevnik' | 'planiranje' | 'ostalo';

export type QuestionStatus = 'pending' | 'published' | 'rejected';

export interface QuestionRegulation {
  key: string;
  title: string;
  gazette: string | null;
  url: string | null;
}

export interface Question {
  id: number;
  slug: string;
  category: QuestionCategory;
  title: string;
  body: string | null;
  excerpt: string;
  valid_on: string | null;
  published_at: string | null;
  answer?: string | null;
  regulations?: QuestionRegulation[];
}

export interface OwnQuestion {
  id: number;
  slug: string | null;
  category: QuestionCategory;
  title: string;
  status: QuestionStatus;
  created_at: string | null;
}

export interface AdminQuestion extends Question {
  status: QuestionStatus;
  regulation_keys: string[];
  original: string | null;
  editor_note: string | null;
  asker: { name: string; email: string } | null;
  answerer: string | null;
  asker_notified_at: string | null;
  created_at: string | null;
}

export interface AdminQuestionPayload {
  category: QuestionCategory;
  title: string;
  slug: string | null;
  body: string | null;
  answer: string | null;
  regulation_keys: string[];
  valid_on: string | null;
  status: QuestionStatus;
  editor_note: string | null;
}

export const QUESTION_CATEGORY_LABELS: Record<QuestionCategory, string> = {
  norma: 'Norma i fond časova',
  ocenjivanje: 'Ocenjivanje',
  oslobadjanje: 'Oslobađanje od nastave',
  bezbednost: 'Bezbednost i odgovornost',
  takmicenja: 'Takmičenja',
  zdravitas: 'Zdravitas',
  'es-dnevnik': 'ES dnevnik',
  planiranje: 'Planiranje',
  ostalo: 'Ostalo',
};

export const QUESTION_STATUS_LABELS: Record<QuestionStatus, string> = {
  pending: 'čeka odgovor',
  published: 'objavljeno',
  rejected: 'neće biti objavljeno',
};

export const LEGAL_DISCLAIMER = 'Odgovori objašnjavaju propise koji važe na navedeni dan; nisu pravni savet. Za konkretan slučaj obratite se sekretaru škole ili sindikatu.';
