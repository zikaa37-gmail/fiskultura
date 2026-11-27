import { IconName } from '../shared/icon/icon';

export interface TemplateReference {
  label: string;
  url: string;
  article?: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  summary: string;
  file: string;
  pages: string;
  icon: IconName;
  accent: 'primary' | 'lime' | 'orange' | 'sky' | 'violet' | 'rose';
  references: TemplateReference[];
  related?: { label: string; route: string };
}

export const TEMPLATES_VERSION = '2026/27';

const ZOOV = 'https://www.paragraf.rs/propisi/zakon_o_osnovnom_obrazovanju_i_vaspitanju.html';
const ZSOV = 'https://www.paragraf.rs/propisi/zakon_o_srednjem_obrazovanju_i_vaspitanju.html';
const SPORT_LAW = 'https://www.paragraf.rs/propisi/zakon_o_sportu.html';

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'saglasnost',
    title: 'Saglasnost roditelja za takmičenje',
    summary: 'Takmičenje, polazak, povratak i prevoz, izjava roditelja, lekarsko uverenje i telefon za hitne slučajeve.',
    file: 'saglasnost-roditelja-takmicenje.docx',
    pages: '1 strana',
    icon: 'trophy',
    accent: 'orange',
    references: [{ label: 'Zakon o sportu', url: SPORT_LAW, article: '143' }],
    related: { label: 'Sme li učenik na takmičenje bez lekarskog pregleda?', route: '/pitanja/sme-li-ucenik-na-takmicenje-bez-lekarskog-pregleda' },
  },
  {
    id: 'oslobadjanje',
    title: 'Zahtev za oslobađanje od praktičnog dela',
    summary: 'Zahtev roditelja direktoru: privremeno ili za godinu, delimično ili potpuno, uz mišljenje izabranog lekara.',
    file: 'zahtev-oslobadjanje-od-fizickog.docx',
    pages: '1 strana',
    icon: 'heart',
    accent: 'rose',
    references: [
      { label: 'ZOOV', url: ZOOV, article: '65' },
      { label: 'ZSOV', url: ZSOV, article: '50' },
    ],
    related: { label: 'Ko oslobađa učenika i kako se on ocenjuje?', route: '/pitanja/ko-oslobadja-ucenika-od-fizickog-i-kako-se-ocenjuje' },
  },
  {
    id: 'testiranje',
    title: 'Zapisnik testiranja',
    summary: 'Tabela za 32 učenika sa svim testovima nacionalne baterije, za merenje na početku i na kraju godine.',
    file: 'zapisnik-testiranja.docx',
    pages: '2 strane, položeno',
    icon: 'chart',
    accent: 'sky',
    references: [],
    related: { label: 'Kako se izvodi svaki test', route: '/sportovi/testiranje' },
  },
  {
    id: 'sekcija',
    title: 'Izveštaj o radu sportske sekcije',
    summary: 'Termini i broj učenika, održani časovi po mesecima, takmičenja i plasmani, teškoće i plan.',
    file: 'izvestaj-sportske-sekcije.docx',
    pages: '2 strane',
    icon: 'ball',
    accent: 'lime',
    references: [],
    related: { label: 'Da li se sekcije računaju u normu?', route: '/pitanja/da-li-se-sportske-sekcije-racunaju-u-normu' },
  },
  {
    id: 'strucno-vece',
    title: 'Plan rada stručnog veća',
    summary: 'Aktivnosti po mesecima od avgusta do juna sa predlozima, nosioci i stručno usavršavanje članova.',
    file: 'plan-rada-strucnog-veca.docx',
    pages: '1 strana',
    icon: 'people',
    accent: 'violet',
    references: [{ label: 'ZOOV', url: ZOOV, article: '40' }],
    related: { label: 'Šta je nedelja školskog sporta?', route: '/pitanja/sta-je-nedelja-skolskog-sporta' },
  },
  {
    id: 'operativni-plan',
    title: 'Operativni plan',
    summary: 'Mesečni plan po časovima: tema, jedinica, tip časa, ishodi, korelacija i evaluacija.',
    file: 'operativni-plan.docx',
    pages: '1 strana, položeno',
    icon: 'clipboard',
    accent: 'primary',
    references: [],
    related: { label: 'Ishodi po razredima', route: '/ishodi' },
  },
];
