import { Facilities } from './facility.model';

export type InstitutionType = 'osnovna' | 'srednja' | 'fakultet';

export interface Institution {
  id: number;
  type: InstitutionType;
  name: string;
  label: string;
  place: string | null;
  municipality: string | null;
  district: string | null;
  region: string;
  address: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  fax: string | null;
  director: string | null;
  pib: string | null;
  registry_number: string | null;
  bank_accounts: string[];
  extra: Record<string, string>;
  facilities: Facilities;
  facility_flags: string[];
  facility_known: string[];
  facilities_origin: Record<string, 'zvanicno' | 'provereno'>;
  pending_submissions: number;
  facilities_source: string | null;
  facilities_updated_at: string | null;
}

export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  osnovna: 'Osnovna škola',
  srednja: 'Srednja škola',
  fakultet: 'Fakultet',
};

export const INSTITUTION_TYPE_ACCENTS: Record<InstitutionType, string> = {
  osnovna: 'sky',
  srednja: 'violet',
  fakultet: 'lime',
};

export function matchDistrict(value: string | null, districts: readonly string[]): string | null {
  const fold = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'dj')
      .replace(/\s*okrug$/, '')
      .trim();
  const wanted = value ? fold(value) : '';
  return wanted ? (districts.find((district) => fold(district) === wanted || wanted.startsWith(fold(district))) ?? null) : null;
}
