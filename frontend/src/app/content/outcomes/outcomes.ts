export type SchoolYear = '2026/27' | '2027/28';

export interface OutcomeTopic {
  name: string;
  contents: string[];
  hours?: string;
}

export interface OutcomeArea {
  name: string;
  topics: OutcomeTopic[];
}

export interface OutcomeProgram {
  key: string;
  level: 'os' | 'ss';
  grade: number;
  gazette: string;
  sourceUrl: string;
  validFrom: string;
  validTo: string | null;
  goal: string;
  outcomes: string[];
  areas: OutcomeArea[];
  verified: 'pis' | 'secondary';
}

export interface OutcomeGrade {
  slug: string;
  level: 'os' | 'ss';
  grade: number;
  label: string;
  title: string;
  programs: string[];
  funds: Record<SchoolYear, string>;
}

export const SCHOOL_YEARS: SchoolYear[] = ['2026/27', '2027/28'];
export const CURRENT_YEAR: SchoolYear = '2026/27';

const FUND_3_108 = '3 časa nedeljno, 108 godišnje';
const FUND_5_6_NOW = '2 časa nedeljno (72 godišnje) i obavezne fizičke aktivnosti 1,5 čas nedeljno (54 godišnje), u okviru predmeta';
const FUND_GYM = '2 časa nedeljno, 74 godišnje';

const ROMAN = ['I', 'II', 'III', 'IV'];

export const OUTCOME_GRADES: OutcomeGrade[] = [
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((grade) => ({
    slug: `${grade}-razred`,
    level: 'os' as const,
    grade,
    label: `${grade}. razred`,
    title: `${grade}. razred osnovne škole`,
    programs: grade === 1 ? ['os-1-2017', 'os-1-2026'] : grade === 5 ? ['os-5-2018', 'os-5-2026'] : [{ 2: 'os-2-2018', 3: 'os-3-2019', 4: 'os-4-2019', 6: 'os-6-2019', 7: 'os-7-2019', 8: 'os-8-2019' }[grade] as string],
    funds:
      grade <= 4 || grade === 7
        ? { '2026/27': FUND_3_108, '2027/28': FUND_3_108 }
        : grade === 8
          ? { '2026/27': '3 časa nedeljno, 102 godišnje (34 nastavne nedelje)', '2027/28': '3 časa nedeljno, 102 godišnje (34 nastavne nedelje)' }
          : { '2026/27': FUND_5_6_NOW, '2027/28': FUND_3_108 },
  })),
  ...[1, 2, 3, 4].map((grade) => ({
    slug: `${grade}-razred-srednje`,
    level: 'ss' as const,
    grade,
    label: `${ROMAN[grade - 1]} razred SŠ`,
    title: `${ROMAN[grade - 1]} razred srednje škole`,
    programs: grade === 1 ? ['ss-1-2020', 'ss-1-2026'] : [`ss-${grade}-2020`],
    funds:
      grade === 4
        ? { '2026/27': '2 časa nedeljno, 66 godišnje (33 nastavne nedelje)', '2027/28': '2 časa nedeljno, 66 godišnje (33 nastavne nedelje)' }
        : { '2026/27': FUND_GYM, '2027/28': FUND_GYM },
  })),
];

const LOADERS: Record<string, () => Promise<{ default: unknown }>> = {
  'os-1-2017': () => import('./os-1-2017.json'),
  'os-1-2026': () => import('./os-1-2026.json'),
  'os-2-2018': () => import('./os-2-2018.json'),
  'os-3-2019': () => import('./os-3-2019.json'),
  'os-4-2019': () => import('./os-4-2019.json'),
  'os-5-2018': () => import('./os-5-2018.json'),
  'os-5-2026': () => import('./os-5-2026.json'),
  'os-6-2019': () => import('./os-6-2019.json'),
  'os-7-2019': () => import('./os-7-2019.json'),
  'os-8-2019': () => import('./os-8-2019.json'),
  'ss-1-2020': () => import('./ss-1-2020.json'),
  'ss-1-2026': () => import('./ss-1-2026.json'),
  'ss-2-2020': () => import('./ss-2-2020.json'),
  'ss-3-2020': () => import('./ss-3-2020.json'),
  'ss-4-2020': () => import('./ss-4-2020.json'),
};

export function findGrade(slug: string): OutcomeGrade | undefined {
  return OUTCOME_GRADES.find((item) => item.slug === slug);
}

export async function loadPrograms(grade: OutcomeGrade): Promise<OutcomeProgram[]> {
  const modules = await Promise.all(grade.programs.map((key) => LOADERS[key]()));
  return modules.map((module) => module.default as OutcomeProgram);
}

export function programFor(programs: OutcomeProgram[], year: SchoolYear): OutcomeProgram | undefined {
  return programs.find((program) => program.validFrom <= year && (!program.validTo || program.validTo >= year)) ?? programs[0];
}

export function changesNextYear(grade: OutcomeGrade): boolean {
  return grade.programs.length > 1 || grade.funds['2026/27'] !== grade.funds['2027/28'];
}
