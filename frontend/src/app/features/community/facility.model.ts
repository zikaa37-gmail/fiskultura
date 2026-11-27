export type FacilityFieldType = 'bool' | 'integer' | 'number' | 'select';

export interface FacilityField {
  label: string;
  type: FacilityFieldType;
  options?: string[];
  section?: string;
}

export interface FacilityList {
  key: string;
  label: string;
  add: string;
  fields: Record<string, FacilityField>;
}

export interface FacilityGroup {
  label: string;
  fields: Record<string, FacilityField>;
  list?: FacilityList;
}

export interface FacilityCatalog {
  groups: Record<string, FacilityGroup>;
  flags: Record<string, string>;
}

export type FacilityValue = boolean | number | string;

export type FacilityEntry = Record<string, FacilityValue>;

export type FacilityGroupValues = Record<string, FacilityValue | FacilityEntry[]>;

export type Facilities = Record<string, FacilityGroupValues | string | undefined> & { napomena?: string };

export interface FacilityStatRow {
  flag: string;
  label: string;
  count: number;
  share: number | null;
}

export interface FacilityReport {
  id: number;
  scope: Record<string, string>;
  stats: { total: number; with_data: number; rows: FacilityStatRow[] };
  summary: { title: string; summary: string; findings: string[]; recommendations: string[] } | null;
  status: string;
  error: string | null;
  author: string | null;
  created_at: string | null;
}

export interface FacilityGroupView {
  key: string;
  label: string;
  items: { label: string; value: string }[];
}

export const ORIGIN_LABELS: Record<string, string> = { zvanicno: 'Zvanično', provereno: 'Provereno' };

function describeValues(fields: Record<string, FacilityField>, values: FacilityEntry | FacilityGroupValues): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = [];
  const sections = new Map<string, string[]>();
  for (const [field, spec] of Object.entries(fields)) {
    const value = values[field];
    if (value === undefined || Array.isArray(value)) {
      continue;
    }
    if (spec.section) {
      if (value !== false) {
        sections.set(spec.section, [...(sections.get(spec.section) ?? []), typeof value === 'boolean' ? spec.label : `${spec.label}: ${value}`]);
      }
      continue;
    }
    items.push({ label: spec.label, value: typeof value === 'boolean' ? (value ? 'da' : 'ne') : String(value) });
  }
  sections.forEach((labels, section) => items.push({ label: section, value: labels.join(', ') }));
  return items;
}

export function describeFacilities(catalog: FacilityCatalog, facilities: Facilities | null | undefined): FacilityGroupView[] {
  if (!facilities) {
    return [];
  }
  return Object.entries(catalog.groups)
    .map(([key, group]) => {
      const values = facilities[key];
      if (!values || typeof values !== 'object') {
        return null;
      }
      const items = describeValues(group.fields, values);
      const entries = group.list ? values[group.list.key] : undefined;
      if (group.list && Array.isArray(entries)) {
        const list = group.list;
        entries.forEach((entry, index) => {
          items.push({ label: `${list.label} ${index + 1}`, value: describeValues(list.fields, entry).map((item) => `${item.label}: ${item.value}`).join(', ') });
        });
      }
      return items.length ? { key, label: group.label, items } : null;
    })
    .filter((group): group is FacilityGroupView => !!group);
}
