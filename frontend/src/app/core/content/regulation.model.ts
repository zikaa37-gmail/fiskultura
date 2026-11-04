export type RegulationKind = 'zakon' | 'nacrt' | 'pravilnik' | 'program' | 'protokol' | 'uputstvo' | 'kalendar' | 'strategija' | 'ostalo';

export type RegulationArea =
  | 'program'
  | 'planiranje'
  | 'ocenjivanje'
  | 'oslobadjanje'
  | 'kalendar'
  | 'norma'
  | 'usavrsavanje'
  | 'evidencija'
  | 'bezbednost'
  | 'podaci'
  | 'prostor-oprema'
  | 'skolski-sport';

export type Verification = 'verified' | 'secondary' | 'unverified';

export interface RegulationVersion {
  version: number;
  replaced_at: string | null;
  replaced_by: string | null;
  note: string | null;
  data: Partial<Pick<Regulation, 'title' | 'kind' | 'areas' | 'gazette' | 'url' | 'valid_from' | 'valid_to' | 'summary' | 'verification' | 'verification_note'>>;
}

export interface Regulation {
  id: number;
  key: string;
  title: string;
  kind: RegulationKind;
  areas: RegulationArea[];
  gazette: string | null;
  url: string | null;
  valid_from: string | null;
  valid_to: string | null;
  summary: string;
  verification: Verification;
  verification_note: string | null;
  sort: number;
  version: number;
  versions_count: number | null;
  updated_at: string | null;
  history?: RegulationVersion[];
}

export interface RegulationPayload {
  key: string;
  title: string;
  kind: RegulationKind;
  areas: RegulationArea[];
  gazette: string | null;
  url: string | null;
  valid_from: string | null;
  valid_to: string | null;
  summary: string;
  verification: Verification;
  verification_note: string | null;
  sort: number | null;
  change_note: string | null;
}

export const REGULATION_KIND_LABELS: Record<RegulationKind, string> = {
  zakon: 'Zakon',
  nacrt: 'Nacrt',
  pravilnik: 'Pravilnik',
  program: 'Program nastave',
  protokol: 'Protokol',
  uputstvo: 'Uputstvo',
  kalendar: 'Kalendar',
  strategija: 'Strategija',
  ostalo: 'Ostalo',
};

export const REGULATION_AREA_LABELS: Record<RegulationArea, string> = {
  program: 'Program',
  planiranje: 'Planiranje',
  ocenjivanje: 'Ocenjivanje',
  oslobadjanje: 'Oslobađanje',
  kalendar: 'Kalendar',
  norma: 'Norma',
  usavrsavanje: 'Usavršavanje',
  evidencija: 'Evidencija',
  bezbednost: 'Bezbednost',
  podaci: 'Podaci',
  'prostor-oprema': 'Prostor i oprema',
  'skolski-sport': 'Školski sport',
};

export const VERIFICATION_LABELS: Record<Verification, string> = {
  verified: 'provereno u originalu',
  secondary: 'prečišćen tekst / kopija',
  unverified: 'nije potvrđeno',
};
