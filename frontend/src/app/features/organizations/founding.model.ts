export type CoverageStatus = 'aktivno' | 'nepoznato' | 'nema';

export interface DistrictCoverage {
  district: string;
  status: CoverageStatus;
  organizations: { slug: string; name: string; city: string | null; status: string }[];
  interest: { city: string; people: number }[];
}

export interface Coverage {
  threshold: number;
  districts: DistrictCoverage[];
}

export interface FoundingConfirmation {
  city: string;
  district: string;
  people: number;
  threshold: number;
}

export const COVERAGE_LABELS: Record<CoverageStatus, string> = {
  aktivno: 'Aktivno društvo',
  nepoznato: 'Društvo postoji, nema vesti',
  nema: 'Nema društva',
};
