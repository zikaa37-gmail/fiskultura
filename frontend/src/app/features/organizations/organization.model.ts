export type OrganizationType = 'strukovno-udruzenje' | 'skolski-sport' | 'institucija' | 'fakultet' | 'sindikat' | 'ostalo';

export type OrganizationLevel = 'republički' | 'pokrajinski' | 'okružni' | 'gradski' | 'opštinski';

export interface Organization {
  slug: string;
  name: string;
  shortName: string | null;
  type: OrganizationType;
  level: OrganizationLevel;
  city: string | null;
  website: string | null;
  social: { facebook?: string; instagram?: string; youtube?: string } | null;
  email: string | null;
  description: string;
  status: string;
  lastActivity: string | null;
}

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  'strukovno-udruzenje': 'Strukovno udruženje',
  'skolski-sport': 'Školski sport',
  institucija: 'Institucija',
  fakultet: 'Fakultet',
  sindikat: 'Sindikat',
  ostalo: 'Ostalo',
};

export const ORGANIZATION_LEVEL_LABELS: Record<OrganizationLevel, string> = {
  republički: 'Republički',
  pokrajinski: 'Pokrajinski',
  okružni: 'Okružni',
  gradski: 'Gradski',
  opštinski: 'Opštinski',
};
