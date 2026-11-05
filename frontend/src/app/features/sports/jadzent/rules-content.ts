export type JadzentPicture =
  | 'court-full'
  | 'dama-field'
  | 'ball'
  | 'net-height'
  | 'ball-in-net'
  | 'team-pairs'
  | 'jokers'
  | 'dama-girl'
  | 'boys-boys'
  | 'girls-girls'
  | 'protect'
  | 'hit-legs'
  | 'hit-head'
  | 'hit-bounce'
  | 'hit-bench'
  | 'bench-return'
  | 'front-zone'
  | 'back-zone'
  | 'front-block'
  | 'height-barrier'
  | 'three-lobs'
  | 'think-fast'
  | 'act-fast'
  | 'gentleman'
  | 'history'
  | 'school'
  | 'handshake'
  | 'help-up';

export type RuleVerdict = 'ok' | 'bad' | null;

export type RuleFocus = [number, number, number];

export interface RuleFrame {
  picture?: JadzentPicture;
  image?: string;
  focus?: RuleFocus;
  caption: string;
  verdict: RuleVerdict;
  info: string;
  interactive?: boolean;
}

export interface RuleCard {
  id: string;
  title: string;
  picture?: JadzentPicture;
  image?: string;
  frames: RuleFrame[];
  question: { text: string; answer: string };
}

export interface QuizQuestion {
  text: string;
  picture?: JadzentPicture;
  image?: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface RuleDocument {
  title: string;
  note: string;
  url: string;
  language: 'sr' | 'en';
  format: 'PDF' | 'sajt';
}

export interface RuleDocumentGroup {
  title: string;
  description: string;
  documents: RuleDocument[];
}

export const RULE_CARDS: RuleCard[] = [
  {
    id: 'about',
    title: 'Šta je jadžent',
    picture: 'history',
    frames: [
      { picture: 'history', caption: 'Srpski sport iz 1993.', verdict: null, info: 'Jadžent je nastao u Srbiji 1993. godine. Pravila je napisao profesor fizičkog vaspitanja iz Temerina Janko Pavlis. Ime je kovanica od JA i DŽENTLMEN.' },
      { picture: 'protect', caption: 'Dečaci i devojčice zajedno', verdict: 'ok', info: 'Jadžent je sport u kom dečaci i devojčice igraju potpuno ravnopravno, u istoj ekipi. Podseća na igru „između četiri vatre", sa petom „vatrom" iz polja Dama.' },
      { picture: 'school', caption: 'U nastavi od 4. do 8. razreda', verdict: null, info: 'Ministarstvo prosvete je 2019. godine uvrstilo jadžent u nastavni plan i program od 4. do 8. razreda, a ZUOV je 2022. odobrio seminar za nastavnike.' },
    ],
    question: { text: 'Od koje dve reči je nastao naziv jadžent?', answer: 'JA i DŽENTLMEN.' },
  },
  {
    id: 'three-rules',
    title: 'Tri glavna pravila',
    picture: 'gentleman',
    frames: [
      { picture: 'think-fast', caption: 'Brzo misli', verdict: 'ok', info: 'Prvo glavno pravilo jadženta: brzo misli — gledaj gde su protivnici i saigrači i odluči koga gađaš.' },
      { picture: 'act-fast', caption: 'Brzo deluj', verdict: 'ok', info: 'Drugo glavno pravilo: brzo deluj — dodaj, gađaj ili se skloni pre nego što protivnik stigne da reaguje.' },
      { picture: 'gentleman', caption: 'Budi džentlmen', verdict: 'ok', info: 'Treće glavno pravilo: budi džentlmen. Dečaci brane devojčice i devojčice brane dečake, a protivnik se poštuje.' },
    ],
    question: { text: 'Koja su tri glavna pravila jadženta?', answer: 'Brzo misli, brzo deluj, budi džentlmen.' },
  },
  {
    id: 'court',
    title: 'Teren, lopta i Dama',
    picture: 'court-full',
    frames: [
      { picture: 'court-full', caption: 'Odbojkaški teren', verdict: null, info: 'Jadžent se igra na odbojkaškom terenu, odbojkaškom loptom. Svaka ekipa je na svojoj polovini terena.' },
      { picture: 'dama-field', caption: 'Polje Dama — 2 m', verdict: null, info: 'Na terenu je posebno obeleženo polje Dama, krug prečnika 2 m. Polje Dama jedne ekipe nalazi se u protivničkoj polovini terena.' },
      { picture: 'ball', caption: 'Odbojkaška lopta', verdict: null, info: 'Igra se odbojkaškom loptom.' },
    ],
    question: { text: 'Koliki je prečnik polja Dama?', answer: '2 m.' },
  },
  {
    id: 'net',
    title: 'Mreža',
    picture: 'net-height',
    frames: [
      { picture: 'net-height', caption: 'Mreža na 1 m', verdict: null, info: 'Na sredini terena je mreža na visini od 1 m. Ona razdvaja igrače dva tima.' },
      { picture: 'ball-in-net', caption: 'Lopta u mreži', verdict: null, info: 'Lopta koja ostane u mreži pripada ekipi sa iste strane mreže.' },
    ],
    question: { text: 'Lopta ostane u mreži. Čija je?', answer: 'Ekipe sa čije je strane mreže.' },
  },
  {
    id: 'team',
    title: 'Ekipa i džokeri',
    picture: 'team-pairs',
    frames: [
      { picture: 'team-pairs', caption: '6 parova', verdict: null, info: 'Ekipu čini 6 parova igrača — u svakom paru su dečak i devojčica. Četiri para igraju u polju, a dva para su džokeri.' },
      { picture: 'jokers', caption: '3 džokera oko terena', verdict: null, info: 'Tri džokera se slobodno kreću oko terena.' },
      { picture: 'dama-girl', caption: 'Džoker u Dami', verdict: null, info: 'Četvrti džoker je devojčica i stoji u polju Dama, u protivničkoj polovini. Ona sme da gađa samo devojčice iz suprotne ekipe.' },
    ],
    question: { text: 'Ko stoji u polju Dama?', answer: 'Džoker — devojčica.' },
  },
  {
    id: 'equality',
    title: 'Ko koga gađa',
    picture: 'boys-boys',
    frames: [
      { picture: 'boys-boys', caption: 'Dečaci gađaju dečake', verdict: 'ok', info: 'Dečaci gađaju samo dečake iz protivničke ekipe.' },
      { picture: 'girls-girls', caption: 'Devojčice gađaju devojčice', verdict: 'ok', info: 'Devojčice gađaju samo devojčice iz protivničke ekipe.' },
      { picture: 'protect', caption: 'Dečak brani devojčicu', verdict: 'ok', info: 'Dečaci brane devojčice od pogotka, a devojčice brane dečake. Zato par igra zajedno.' },
    ],
    question: { text: 'Koga sme da gađa dečak?', answer: 'Samo dečake iz protivničke ekipe.' },
  },
  {
    id: 'hits',
    title: 'Gađanje',
    picture: 'hit-legs',
    frames: [
      { picture: 'hit-legs', caption: 'Od pojasa naniže', verdict: 'ok', info: 'Dozvoljeno je gađati samo od pojasa naniže.' },
      { picture: 'hit-head', caption: 'U glavu — kazna', verdict: 'bad', info: 'Pogodak u glavu se kažnjava.' },
      { picture: 'hit-bounce', caption: 'Jedan odskok važi', verdict: 'ok', info: 'Važe direktni pogoci i pogoci posle jednog odskoka lopte o pod.' },
    ],
    question: { text: 'Lopta odskoči jednom o pod pa pogodi igrača. Važi li?', answer: 'Važi.' },
  },
  {
    id: 'bench',
    title: 'Pogođeni i povratak',
    picture: 'bench-return',
    frames: [
      { picture: 'hit-bench', caption: 'Na klupu', verdict: null, info: 'Pogođeni igrač odlazi na klupu za pogođene igrače i čeka da se vrati u igru.' },
      { picture: 'bench-return', caption: 'Par se vraća', verdict: 'ok', info: 'Kad se na klupi za pogođene nađu dečak i devojčica, oni se zajedno vraćaju u igru.' },
    ],
    question: { text: 'Kada se pogođeni igrači vraćaju u igru?', answer: 'Kad su na klupi dečak i devojčica — vraćaju se zajedno.' },
  },
  {
    id: 'zones',
    title: 'Prednje i zadnje polje',
    picture: 'front-zone',
    frames: [
      { picture: 'front-zone', caption: 'Prednje polje — jedan par', verdict: null, info: 'U prednjem odbojkaškom polju (3 m uz mrežu) sme da stoji samo jedan par igrača. Igrači iz prednjeg polja smeju da gađaju samo igrače u suprotnom zadnjem polju.' },
      { picture: 'back-zone', caption: 'Zadnje polje — jedan par', verdict: null, info: 'U zadnjem odbojkaškom polju (6 m) sme da stoji samo jedan par igrača. Oni mogu da gađaju igrače suprotne ekipe koji su u zadnjem polju.' },
      { picture: 'front-block', caption: 'Ometanje iz prednjeg polja', verdict: 'ok', info: 'Igrači u prednjem polju smeju da ometaju gađanje suprotne ekipe iz prednjeg polja.' },
    ],
    question: { text: 'Koliko parova sme da stoji u prednjem polju?', answer: 'Samo jedan par.' },
  },
  {
    id: 'barrier',
    title: 'Visinska barijera',
    picture: 'height-barrier',
    frames: [
      { picture: 'height-barrier', caption: 'Ne iznad 2,43 m', verdict: 'bad', info: 'Postoji visinska barijera od 2,43 m — visina muške odbojkaške mreže. Lopta se ne baca iznad nje, da se igra ne bi odugovlačila bacanjem „balona".' },
      { picture: 'three-lobs', caption: 'Najviše 3 prebacivanja', verdict: null, info: 'Lopta sme da se prebaci najviše 3 puta bez gađanja. Posle toga ekipa mora da gađa.' },
    ],
    question: { text: 'Koliko puta lopta sme da se prebaci bez gađanja?', answer: 'Najviše 3 puta.' },
  },
  {
    id: 'fair-play',
    title: 'Fer-plej',
    picture: 'handshake',
    frames: [
      { picture: 'handshake', caption: 'Pozdravi protivnika', verdict: 'ok', info: 'Pozdravi protivnika i sudiju pre i posle utakmice — tako rade džentlmeni.' },
      { picture: 'help-up', caption: 'Pomozi da ustane', verdict: 'ok', info: 'Kad neko padne, pomozi mu da ustane, i kad je iz protivničke ekipe.' },
    ],
    question: { text: 'Šta radi džentlmen kad protivnik padne?', answer: 'Pomogne mu da ustane.' },
  },
];

export const QUIZ: QuizQuestion[] = [
  { text: 'Na kom terenu se igra jadžent?', options: ['Rukometnom', 'Odbojkaškom', 'Košarkaškom'], correct: 1, explanation: 'Na odbojkaškom terenu, odbojkaškom loptom.' },
  { text: 'Na kojoj visini je mreža?', picture: 'net-height', options: ['1 m', '2,24 m', '2,43 m'], correct: 0, explanation: 'Mreža je na visini od 1 m.' },
  { text: 'Koliko parova čini ekipu?', options: ['4', '6', '8'], correct: 1, explanation: '6 parova: 4 u polju i 2 para džokera.' },
  { text: 'Koga gađaju devojčice?', picture: 'girls-girls', options: ['Sve igrače', 'Samo devojčice', 'Samo dečake'], correct: 1, explanation: 'Devojčice gađaju devojčice, dečaci dečake.' },
  { text: 'Gde sme da se gađa?', picture: 'hit-legs', options: ['Bilo gde', 'Od pojasa naniže', 'Samo u leđa'], correct: 1, explanation: 'Samo od pojasa naniže; pogodak u glavu se kažnjava.' },
  { text: 'Lopta odskoči jednom pa pogodi igrača. Važi li?', picture: 'hit-bounce', options: ['Važi', 'Ne važi', 'Ponavlja se'], correct: 0, explanation: 'Važe direktni pogoci i pogoci sa jednim odskokom.' },
  { text: 'Kada se pogođeni vraćaju u igru?', options: ['Posle 1 minuta', 'Kad su na klupi dečak i devojčica', 'Nikad'], correct: 1, explanation: 'Dečak i devojčica sa klupe vraćaju se zajedno.' },
  { text: 'Ko stoji u polju Dama?', picture: 'dama-girl', options: ['Kapiten', 'Džoker — devojčica', 'Sudija'], correct: 1, explanation: 'U Dami je džoker ženskog pola; ona gađa samo devojčice.' },
  { text: 'Koliko prebacivanja bez gađanja je dozvoljeno?', options: ['1', '3', 'Koliko hoćeš'], correct: 1, explanation: 'Najviše 3 prebacivanja bez gađanja.' },
  { text: 'Koja su tri glavna pravila?', options: ['Brzo misli, brzo deluj, budi džentlmen', 'Trči, skoči, baci', 'Pobedi po svaku cenu'], correct: 0, explanation: 'Brzo misli, brzo deluj, budi džentlmen.' },
];

export const RULE_DOCUMENT_GROUPS: RuleDocumentGroup[] = [
  {
    title: 'Zvanična pravila igre',
    description: 'Pravila jadženta, kako ih objavljuje zvanični sajt sporta.',
    documents: [
      { title: 'Jadžent — pravila igre', note: 'PDF sa svim pravilima', url: 'https://jadzent.fiskultura.rs/files/jadzent-pravila-igre.pdf', language: 'sr', format: 'PDF' },
      { title: 'Sajt jadženta', note: 'pravila, istorija, galerija, rodna ravnopravnost', url: 'https://jadzent.fiskultura.rs/', language: 'sr', format: 'sajt' },
    ],
  },
];

export const RULE_SOURCE_URL = 'https://jadzent.fiskultura.rs/rules';
