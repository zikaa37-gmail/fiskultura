import { ModuleAccent } from '../portal-content';
import { IconName } from '../../shared/icon/icon';

export const REVIEW_MONTHS = 6;

export interface RuleChange {
  from: string;
  text: string;
  regulation: string;
}

export interface RuleMyth {
  myth: string;
  truth: string;
}

export interface RulePrevious {
  period: string;
  text: string;
  regulation: string;
}

export interface RuleTimelineItem {
  date: string;
  text: string;
  regulations: string[];
}

export interface RuleLink {
  label: string;
  route: string;
}

export interface RuleTopic {
  slug: string;
  title: string;
  cardTitle: string;
  accent: ModuleAccent;
  icon: IconName;
  card: string;
  short: string;
  change?: string;
  since: string;
  now: string;
  regulations: string[];
  upcoming: RuleChange[];
  myths: RuleMyth[];
  previous: RulePrevious[];
  story: string;
  timeline: RuleTimelineItem[];
  links: RuleLink[];
  checkedAt: string;
  reviewedBy: string;
  aiAssisted: boolean;
}

export const RULE_TOPICS: RuleTopic[] = [
  {
    slug: 'fond-casova',
    title: 'Fond časova fizičkog i zdravstvenog vaspitanja',
    cardTitle: 'Fond časova',
    accent: 'primary',
    icon: 'chart',
    card: '1–4, 7. i 8. razred imaju 3 časa nedeljno, 5. i 6. razred 2 časa i obavezne fizičke aktivnosti; od 2027/28. i 5. i 6. razred dobijaju 3 časa.',
    short: '3 časa nedeljno; 5. i 6. razred 2 + OFA',
    change: '2027/28.',
    since: 'školska 2026/27.',
    now: [
      'Broj časova propisuje **plan nastave i učenja** za svaki razred. U školskoj 2026/27. važi:',
      '- **1–4. razred:** 3 časa nedeljno, 108 godišnje.\n- **5. i 6. razred:** 2 časa nedeljno (72 godišnje) i **obavezne fizičke aktivnosti** 1,5 čas nedeljno (54 godišnje), koje se ostvaruju u okviru predmeta.\n- **7. razred:** 3 časa nedeljno, 108 godišnje.\n- **8. razred:** 3 časa nedeljno, 102 godišnje (školska godina je kraća zbog završnog ispita).\n- **Gimnazija:** 2 časa nedeljno, 74 godišnje, u IV razredu 66.',
      'Za srednje stručne škole fond zavisi od obrazovnog profila; piše u planu za taj profil.',
    ].join('\n\n'),
    regulations: ['program-1-2017', 'program-5-6-2018', 'plan-7-8-2018', 'gimnazija-2020'],
    upcoming: [
      {
        from: '2027/28.',
        text: '**5. i 6. razred dobijaju 3 časa nedeljno (108 godišnje).** Obavezne fizičke aktivnosti više nisu u planu; zamenjuje ih treći čas predmeta.',
        regulation: 'program-5-6-izmene-2026',
      },
      {
        from: '2027/28.',
        text: 'Nov plan za 7. i 8. razred menja druge predmete; **fond FZV ostaje 3 časa** (108, odnosno 102).',
        regulation: 'plan-7-8-izmena-2026',
      },
    ],
    myths: [
      {
        myth: 'Fizičko u 7. i 8. razredu ima 2 časa nedeljno.',
        truth: 'To je važilo po planu iz 2007. Od školske 2020/21. u 7. razredu i od 2021/22. u 8. razredu predmet ima **3 časa nedeljno**.',
      },
      {
        myth: 'Treći čas je „izabrani sport”.',
        truth: 'Obavezni izborni predmet „Fizičko vaspitanje – izabrani sport” postojao je po planu iz 2007. Novi planovi ga nemaju; nestao je postepeno, u 5. razredu od 2018/19, a u 8. od 2021/22. Danas je sve **jedan predmet, Fizičko i zdravstveno vaspitanje**.',
      },
      {
        myth: 'Obavezne fizičke aktivnosti su vannastavna aktivnost i ne ulaze u fond.',
        truth: 'Obavezne fizičke aktivnosti (54 časa godišnje) u 5. i 6. razredu deo su predmeta i ostvaruju se **u okviru predmeta**. Važe do kraja 2026/27; od 2027/28. umesto njih predmet ima 3 časa.',
      },
      {
        myth: 'Predmet se zove „fizičko vaspitanje”.',
        truth: 'Od novih programa (1. i 5. razred od 2018/19) predmet se zove **Fizičko i zdravstveno vaspitanje**. Tako ga treba pisati u planovima, dnevniku i rešenjima.',
      },
    ],
    previous: [
      {
        period: '2007/08 – 2020/21. (5–8. razred, uvođeno i ukidano po razredima)',
        text: '**Fizičko vaspitanje 2 časa nedeljno** (72, u 8. razredu 68) i obavezni izborni predmet **„Fizičko vaspitanje – izabrani sport” 1 čas nedeljno**.',
        regulation: 'plan-5-8-2007',
      },
      {
        period: '2005/06 – 2020/21. (1–4. razred)',
        text: 'Fizičko vaspitanje 3 časa nedeljno, 108 godišnje – isti fond kao danas.',
        regulation: 'plan-1-4-2005',
      },
    ],
    story: [
      'Fond časova se nije menjao odjednom, nego **po generacijama**: nov plan počne u jednom razredu i svake godine se pomeri razred više. Zato su u istoj školi nekoliko godina istovremeno važila dva plana, pa je lako ostati pri onome što je važilo kad smo počinjali da radimo.',
      'Po planu iz 2007. učenik od 5. do 8. razreda imao je **dva predmeta**: Fizičko vaspitanje (2 časa) i Fizičko vaspitanje – izabrani sport (1 čas). Reforma koja je počela 2018. spojila je kretanje u **jedan predmet, Fizičko i zdravstveno vaspitanje**. U 5. i 6. razredu treći čas je zamenjen obaveznim fizičkim aktivnostima (1,5 čas nedeljno u okviru predmeta), a u 7. i 8. razredu predmet je dobio pun fond od **3 časa**.',
      'Izmena iz 2026. izjednačava drugi ciklus: **od 2027/28. i 5. i 6. razred imaju 3 časa**, a obavezne fizičke aktivnosti prestaju. U 1–4. razredu fond je od 2005. isti, 3 časa nedeljno.',
    ].join('\n\n'),
    timeline: [
      { date: '2027/28.', text: '5. i 6. razred: 3 časa nedeljno (108); obavezne fizičke aktivnosti prestaju. Novi programi za 1. i 5. razred.', regulations: ['program-5-6-izmene-2026', 'program-1-2026'] },
      { date: '2021/22.', text: '8. razred: Fizičko i zdravstveno vaspitanje 3 časa (102) umesto 2 časa i izabranog sporta. Poslednji razred prelazi na nov plan.', regulations: ['plan-7-8-2018'] },
      { date: '2020/21.', text: '7. razred: Fizičko i zdravstveno vaspitanje 3 časa (108).', regulations: ['plan-7-8-2018'] },
      { date: '2019/20.', text: '6. razred: 2 časa i obavezne fizičke aktivnosti 1,5 čas nedeljno.', regulations: ['program-5-6-2018'] },
      { date: '2018/19.', text: '5. razred: 2 časa i obavezne fizičke aktivnosti 1,5 čas nedeljno; 1. razred: 3 časa. Predmet dobija naziv Fizičko i zdravstveno vaspitanje.', regulations: ['program-5-6-2018', 'program-1-2017'] },
      { date: '2007/08 – 2010/11.', text: 'Plan za 5–8. razred uvodi se po razredima: Fizičko vaspitanje 2 časa i Fizičko vaspitanje – izabrani sport 1 čas.', regulations: ['plan-5-8-2007'] },
      { date: '2005/06.', text: 'Plan za 1–4. razred: Fizičko vaspitanje 3 časa nedeljno (2. i 4. razred od 2006/07).', regulations: ['plan-1-4-2005'] },
    ],
    links: [
      { label: 'Ishodi i teme po razredima', route: '/ishodi' },
      { label: 'Koliko časova planirati u 2026/27?', route: '/pitanja/koliko-casova-fizickog-planirati-2026-27' },
    ],
    checkedAt: '2026-11-06',
    reviewedBy: 'Uredništvo Fiskulture',
    aiAssisted: true,
  },
  {
    slug: 'programi-i-ishodi',
    title: 'Programi nastave i učenja i ishodi',
    cardTitle: 'Programi i ishodi',
    accent: 'violet',
    icon: 'book',
    card: 'U svim razredima važe programi sa ishodima (od 2018/19. do 2021/22); od 2027/28. novi programi za 1. i 5. razred i I razred gimnazije.',
    short: 'Programi sa ishodima u svim razredima',
    change: '2027/28.',
    since: 'školska 2026/27.',
    now: [
      'Svaki razred ima **program nastave i učenja**: cilj predmeta, **ishode** (šta učenik ume na kraju razreda), oblasti, teme i sadržaje. Programi su uvođeni po razredima:',
      '- **1. razred** od 2018/19, **2.** od 2019/20, **3.** od 2020/21, **4.** od 2021/22.\n- **5. razred** od 2018/19, **6.** od 2019/20, **7.** od 2020/21, **8.** od 2021/22.\n- **Gimnazija:** pravilnik iz 2020. („Prosvetni glasnik” 4/2020).',
      'U 1–4. razredu broj časova po temama planira nastavnik prema uslovima rada; program ga ne propisuje. Ishodi, teme i sadržaji za svaki razred su na stranici **Ishodi po razredima**, sa linkom na zvanični tekst.',
    ].join('\n\n'),
    regulations: ['program-1-2017', 'program-2-2018', 'program-3-2019', 'program-4-2019', 'program-5-6-2018', 'program-6-2019', 'program-7-2019', 'program-8-2019', 'gimnazija-2020'],
    upcoming: [
      { from: '2027/28.', text: 'Nov program za **1. razred**.', regulation: 'program-1-2026' },
      { from: '2027/28.', text: 'Nov program za **5. razred** (i 3 časa nedeljno u 5. i 6. razredu).', regulation: 'program-5-6-izmene-2026' },
      { from: '2027/28.', text: 'Nov program za **I razred gimnazije**.', regulation: 'gimnazija-izmena-2026' },
    ],
    myths: [
      {
        myth: 'Planira se po starom programu, sa operativnim zadacima i spiskom nastavnih jedinica.',
        truth: 'Stari programi (2004–2010) ne važe ni u jednom razredu od školske 2021/22. Planira se po **ishodima** iz važećeg programa.',
      },
      {
        myth: 'Program propisuje tačan broj časova za svaku temu i u nižim razredima.',
        truth: 'Za 1–4. razred program kaže da se broj časova po temama **planira na osnovu procene nastavnika**, prema uslovima rada.',
      },
    ],
    previous: [
      { period: 'do 2018/19. (1. razred), do 2019/20. (2. razred)', text: 'Program fizičkog vaspitanja za 1. i 2. razred.', regulation: 'program-1-2-2004' },
      { period: 'do 2020/21. (3. razred)', text: 'Plan za 1–4. razred i program za 3. razred.', regulation: 'plan-1-4-2005' },
      { period: 'do 2020/21. (4. razred)', text: 'Program fizičkog vaspitanja za 4. razred.', regulation: 'program-4-2006' },
      { period: '2007/08 – 2017/18. (5. razred)', text: 'Plan za drugi ciklus i program za 5. razred.', regulation: 'plan-5-8-2007' },
      { period: '2008/09 – 2018/19. (6. razred)', text: 'Program fizičkog vaspitanja za 6. razred.', regulation: 'program-6-2008' },
      { period: '2009/10 – 2019/20. (7. razred)', text: 'Program fizičkog vaspitanja za 7. razred.', regulation: 'program-7-2009' },
      { period: '2010/11 – 2020/21. (8. razred)', text: 'Program fizičkog vaspitanja za 8. razred.', regulation: 'program-8-2010' },
    ],
    story: [
      'Stari programi iz 2004–2010. bili su pisani kao **ciljevi, operativni zadaci i sadržaji** – nastavnik je znao šta treba da obradi. Reforma koja je počela 2018. uvela je **programe nastave i učenja usmerene na ishode**: polazi se od toga šta učenik treba da ume na kraju razreda, a teme i sadržaji su sredstvo da se to postigne.',
      'Novi programi uvođeni su generacijski: u 1. i 5. razredu 2018/19, a svake sledeće godine razred više, sve do 4. i 8. razreda 2021/22. Od tada stari programi ne važe ni u jednom razredu osnovne škole.',
      'Od 2027/28. kreće sledeći krug: novi programi za 1. i 5. razred osnovne škole i za I razred gimnazije. Učenici koji su već krenuli po postojećem programu završavaju po njemu.',
    ].join('\n\n'),
    timeline: [
      { date: '2027/28.', text: 'Novi programi za 1. i 5. razred OŠ i I razred gimnazije.', regulations: ['program-1-2026', 'program-5-6-izmene-2026', 'gimnazija-izmena-2026'] },
      { date: '2021/22.', text: 'Programi sa ishodima u 4. i 8. razredu – svi razredi OŠ rade po novim programima.', regulations: ['program-4-2019', 'program-8-2019'] },
      { date: '2020/21.', text: 'Programi sa ishodima u 3. i 7. razredu; nov pravilnik za gimnaziju.', regulations: ['program-3-2019', 'program-7-2019', 'gimnazija-2020'] },
      { date: '2019/20.', text: 'Programi sa ishodima u 2. i 6. razredu.', regulations: ['program-2-2018', 'program-6-2019'] },
      { date: '2018/19.', text: 'Prvi programi nastave i učenja sa ishodima: 1. i 5. razred.', regulations: ['program-1-2017', 'program-5-6-2018'] },
      { date: '2004–2010.', text: 'Nastavni programi fizičkog vaspitanja po razredima (ciljevi, operativni zadaci, sadržaji).', regulations: ['program-1-2-2004', 'plan-1-4-2005', 'program-4-2006', 'plan-5-8-2007', 'program-6-2008', 'program-7-2009', 'program-8-2010'] },
    ],
    links: [{ label: 'Ishodi po razredima', route: '/ishodi' }],
    checkedAt: '2026-11-06',
    reviewedBy: 'Uredništvo Fiskulture',
    aiAssisted: true,
  },
];

export function findRuleTopic(slug: string): RuleTopic | undefined {
  return RULE_TOPICS.find((topic) => topic.slug === slug);
}

export function reviewDue(checkedAt: string, today: Date = new Date()): boolean {
  const checked = new Date(`${checkedAt}T00:00:00`);
  const limit = new Date(checked);
  limit.setMonth(limit.getMonth() + REVIEW_MONTHS);
  const schoolYearStart = new Date(today.getFullYear(), 8, 1);
  const beforeSchoolYear = today.getMonth() >= 6 && today < schoolYearStart && checked < new Date(today.getFullYear(), 5, 1);
  return today >= limit || beforeSchoolYear;
}
