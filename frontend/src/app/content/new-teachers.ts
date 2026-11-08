import { IconName } from '../shared/icon/icon';

const ZOSOV = 'https://www.paragraf.rs/propisi/zakon_o_osnovama_sistema_obrazovanja_i_vaspitanja.html';

export const NEW_TEACHERS_CHECKED_AT = '2026-11-08';

export interface StartRule {
  title: string;
  text: string;
  article: number;
}

export const START_RULES: StartRule[] = [
  {
    title: '30 bodova iz pedagogije, psihologije i metodike',
    text: 'Za rad u školi treba ti najmanje 30 ESPB iz psiholoških, pedagoških i metodičkih disciplina (najmanje po 6 iz svake i 6 bodova prakse u školi). Ako ih nemaš sa studija, stičeš ih za godinu, najviše dve od zaposlenja, jer bez njih ne možeš na ispit za licencu.',
    article: 142,
  },
  {
    title: 'Prvo zaposlenje: pripravnik sa mentorom',
    text: 'Kad prvi put radiš kao nastavnik, ti si pripravnik. Škola ti određuje mentora, a prva tri meseca radiš pod neposrednim nadzorom nastavnika koji ima licencu.',
    article: 145,
  },
  {
    title: 'Bez licence najduže dve godine',
    text: 'Pripravnik, kao i onaj ko radi na zameni, sme bez licence da radi najviše dve godine od dana zasnivanja radnog odnosa u toj školi.',
    article: 144,
  },
  {
    title: 'Ispit za licencu posle godinu dana',
    text: 'Kad savladaš program uvođenja u posao, posle navršene godine rada imaš pravo da polažeš ispit. Pripravnički staž traje najduže dve godine i prestaje kad položiš. Troškove ispita snosi škola.',
    article: 145,
  },
  {
    title: 'Licencu izdaje Ministarstvo',
    text: 'Licenca je javna isprava i izdaje se kad položiš ispit. Škola je dužna da Ministarstvu dostavi podatke o tvojoj licenci.',
    article: 147,
  },
  {
    title: 'Stručno usavršavanje je obavezno',
    text: 'Usavršavaju se svi, sa licencom i bez nje. Imaš pravo na tri radna dana godišnje za odobrene seminare, a dokaze čuvaš u portfoliju (mapi profesionalnog razvoja).',
    article: 151,
  },
];

export function startRuleUrl(article: number): string {
  return `${ZOSOV}#clan_${article}`;
}

export interface StartStep {
  title: string;
  text: string;
  icon: IconName;
  accent: 'primary' | 'lime' | 'orange' | 'sky' | 'violet' | 'rose';
  link: string;
  queryParams?: Record<string, string>;
}

export const START_STEPS: StartStep[] = [
  { title: 'Šta važi danas', text: 'Fond časova, programi i šta se menja, bez pravničkog jezika', icon: 'book', accent: 'primary', link: '/propisi' },
  { title: 'Ishodi po razredima', text: 'Šta učenik treba da zna na kraju svakog razreda', icon: 'checklist', accent: 'lime', link: '/ishodi' },
  { title: 'Planiranje', text: 'e-pripreme: godišnji plan i pripreme za čas iz programa', icon: 'clipboard', accent: 'violet', link: '/aplikacije' },
  { title: 'Pitanja i odgovori', text: 'Ocenjivanje, oslobađanje, dežurstva: odgovori sa propisom', icon: 'help', accent: 'orange', link: '/pitanja' },
  { title: 'Pravila sportova', text: 'Kratka pravila, kviz i uputstva za čas', icon: 'ball', accent: 'sky', link: '/sportovi' },
  { title: 'Testiranje učenika', text: 'Testovi fizičkih sposobnosti i kako se meri', icon: 'chart', accent: 'rose', link: '/sportovi/testiranje' },
  { title: 'Udruženja', text: 'Strukovna udruženja, savezi i njihove objave', icon: 'people', accent: 'lime', link: '/udruzenja' },
  { title: 'Kome se obratiti', text: 'Ministarstvo, školska uprava, inspekcija, ZUOV', icon: 'mail', accent: 'orange', link: '/propisi', queryParams: { tab: 'kontakti' } },
];

export const FACULTY_SOURCES = [
  { id: 'fsfv-bg', name: 'Fakultet sporta i fizičkog vaspitanja, Beograd' },
  { id: 'fsfv-ns', name: 'Fakultet sporta i fizičkog vaspitanja, Novi Sad' },
  { id: 'fsfv-nis', name: 'Fakultet sporta i fizičkog vaspitanja, Niš' },
];
