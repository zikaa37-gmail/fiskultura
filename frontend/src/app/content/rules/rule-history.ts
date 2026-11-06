export interface RuleEra {
  period: string;
  title: string;
  text: string;
  topics: string[];
  regulations: string[];
}

export const RULE_HISTORY_INTRO = [
  'Propisi o nastavi fizičkog vaspitanja menjaju se **postepeno, po generacijama**: nov plan ili program počne u jednom razredu i svake godine se pomeri za razred. Zato u istoj školi po nekoliko godina istovremeno važe stari i novi propis, a lako je ostati pri onome što je važilo kad smo počinjali da radimo.',
  'Ovde je kratka priča o velikim promenama, od starijih ka novijim. Za svaku temu tačno stanje, sa datumima i linkovima na zvanični tekst, je na stranici teme.',
].join('\n\n');

export const RULE_HISTORY: RuleEra[] = [
  {
    period: '2004–2010.',
    title: 'Nastavni planovi i programi fizičkog vaspitanja',
    text: [
      'Predmet se zove **Fizičko vaspitanje**. Programi su pisani kao cilj, operativni zadaci i sadržaji po razredima.',
      '- U 1–4. razredu: **3 časa nedeljno**.\n- U 5–8. razredu: **2 časa nedeljno** i obavezni izborni predmet **„Fizičko vaspitanje – izabrani sport”, 1 čas nedeljno** (plan iz 2007, uveden od 5. razreda 2007/08. do 8. razreda 2010/11).',
    ].join('\n\n'),
    topics: ['fond-casova', 'programi-i-ishodi'],
    regulations: ['plan-1-4-2005', 'plan-5-8-2007'],
  },
  {
    period: '2018/19 – 2021/22.',
    title: 'Reforma: programi nastave i učenja usmereni na ishode',
    text: [
      'Predmet dobija naziv **Fizičko i zdravstveno vaspitanje**, a programi polaze od **ishoda** – šta učenik ume na kraju razreda. Uvođeno je po razredima: 1. i 5. razred 2018/19, pa svake godine razred više, do 4. i 8. razreda 2021/22.',
      '- Izabrani sport kao poseban predmet nestaje.\n- **5. i 6. razred:** 2 časa i obavezne fizičke aktivnosti 1,5 čas nedeljno, u okviru predmeta.\n- **7. i 8. razred:** 3 časa nedeljno.\n- **Gimnazija:** nov pravilnik 2020, 2 časa nedeljno.',
    ].join('\n\n'),
    topics: ['fond-casova', 'programi-i-ishodi'],
    regulations: ['program-1-2017', 'program-5-6-2018', 'plan-7-8-2018', 'gimnazija-2020'],
  },
  {
    period: 'od 2027/28.',
    title: 'Novi programi i 3 časa u celom drugom ciklusu',
    text: [
      'Izmene objavljene u „Prosvetnom glasniku” 1/2026:',
      '- **5. i 6. razred dobijaju 3 časa nedeljno**; obavezne fizičke aktivnosti prestaju.\n- Novi programi za **1. i 5. razred** osnovne škole i **I razred gimnazije**.\n- Fond u 7. i 8. razredu ostaje 3 časa.',
    ].join('\n\n'),
    topics: ['fond-casova', 'programi-i-ishodi'],
    regulations: ['program-5-6-izmene-2026', 'program-1-2026', 'gimnazija-izmena-2026'],
  },
];
