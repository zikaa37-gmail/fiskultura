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

export type RegulationStatus = 'vazi' | 'najava' | 'nacrt' | 'prestao';

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
  status: RegulationStatus;
  replaced_by: string[];
  checked_at: string | null;
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
  replaced_by: string[];
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

export const REGULATION_STATUS_LABELS: Record<RegulationStatus, string> = {
  vazi: 'važi',
  najava: 'primenjuje se kasnije',
  nacrt: 'nacrt',
  prestao: 'ne važi',
};

export interface RegulationReview extends Regulation {
  eli: string | null;
  pis_amendments: string | null;
  pis_checked_at: string | null;
  change_detected_at: string | null;
  change_detail: string | null;
  checked_by: string | null;
}

export function normalizeRegulations(items: Regulation[]): Regulation[] {
  return items.map((item) => ({ ...item, status: item.status ?? 'vazi', replaced_by: item.replaced_by ?? [], checked_at: item.checked_at ?? null }));
}
