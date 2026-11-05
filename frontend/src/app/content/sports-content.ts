import { ModuleAccent, ModuleStatus } from './portal-content';

export type SportGroup = 'games' | 'athletics' | 'gymnastics' | 'elementary' | 'dance';

export interface Sport {
  slug: string;
  name: string;
  group: SportGroup;
  summary: string;
  accent: ModuleAccent;
  status: ModuleStatus;
  officialSources: { label: string; url: string }[];
  externalSite?: string;
  rulesPage?: string;
}

export const SPORT_GROUPS: { id: SportGroup; title: string; description: string }[] = [
  { id: 'games', title: 'Sportske igre', description: 'Pravila prilagođena školskom času, kviz i PDF uputstvo.' },
  { id: 'athletics', title: 'Atletika', description: 'Discipline po fazama tehnike, česte greške, merenje.' },
  { id: 'gymnastics', title: 'Gimnastika', description: 'Elementi po spravama, metodski niz, čuvanje i pomaganje.' },
  { id: 'elementary', title: 'Elementarne igre', description: 'Igre za uvodni deo i završnicu časa, po uzrastu.' },
  { id: 'dance', title: 'Plesovi', description: 'Narodna kola i društveni plesovi iz programa.' },
];

export const SPORTS: Sport[] = [
  {
    slug: 'kosarka',
    name: 'Košarka',
    group: 'games',
    summary: 'Teren, dribling, koraci, 3 i 24 sekunde, faulovi — i kako igrati sa celim odeljenjem.',
    accent: 'orange',
    status: 'ready',
    rulesPage: '/sportovi/kosarka',
    officialSources: [
      { label: 'Košarkaški savez Srbije', url: 'https://www.kss.rs/' },
      { label: 'FIBA pravila', url: 'https://www.fiba.basketball/documents' },
    ],
  },
  {
    slug: 'odbojka',
    name: 'Odbojka',
    group: 'games',
    summary: 'Rotacija, servis, tri dodira, mreža i mini odbojka za mlađe razrede.',
    accent: 'primary',
    status: 'first',
    officialSources: [
      { label: 'Odbojkaški savez Srbije', url: 'https://www.ossrb.org/' },
      { label: 'FIVB pravila', url: 'https://www.fivb.com/volleyball/the-game/official-volleyball-rules/' },
    ],
  },
  {
    slug: 'rukomet',
    name: 'Rukomet',
    group: 'games',
    summary: 'Prostor golmana, tri koraka, tri sekunde, isključenje, sedmerac i mini rukomet.',
    accent: 'sky',
    status: 'first',
    officialSources: [
      { label: 'Rukometni savez Srbije', url: 'https://www.rss.org.rs/' },
      { label: 'IHF pravila', url: 'https://www.ihf.info/regulations-documents' },
    ],
  },
  {
    slug: 'mali-fudbal',
    name: 'Mali fudbal',
    group: 'games',
    summary: 'Aut, korner, kazneni prostor, akumulirani faulovi i izmene u letu.',
    accent: 'lime',
    status: 'first',
    officialSources: [{ label: 'Fudbalski savez Srbije — futsal', url: 'https://fss.rs/' }],
  },
  {
    slug: 'jadzent',
    name: 'Jadžent',
    group: 'games',
    summary: 'Srpski sport iz 1993. u kom dečaci i devojčice igraju ravnopravno — „brzo misli, brzo deluj, budi džentlmen".',
    accent: 'violet',
    status: 'ready',
    officialSources: [],
    externalSite: 'https://jadzent.fiskultura.rs/',
  },
  {
    slug: 'atletika',
    name: 'Atletika',
    group: 'athletics',
    summary: 'Trčanja, skokovi, bacanja i štafeta: tehnika po fazama, merenje i pravila takmičenja.',
    accent: 'orange',
    status: 'soon',
    officialSources: [{ label: 'Atletski savez Srbije', url: 'https://www.ass.org.rs/' }],
  },
  {
    slug: 'gimnastika',
    name: 'Gimnastika',
    group: 'gymnastics',
    summary: 'Tlo, preskok, greda, vratilo, razboj, krugovi — elementi po razredu i mere sigurnosti.',
    accent: 'rose',
    status: 'soon',
    officialSources: [],
  },
  {
    slug: 'elementarne-igre',
    name: 'Elementarne igre',
    group: 'elementary',
    summary: '„Između dve vatre", „Graničar", štafetne igre i igre hvatanja — po uzrastu i delu časa.',
    accent: 'lime',
    status: 'soon',
    officialSources: [],
  },
  {
    slug: 'plesovi',
    name: 'Plesovi',
    group: 'dance',
    summary: 'Narodna kola i društveni plesovi: koraci po taktovima, muzika i video.',
    accent: 'violet',
    status: 'soon',
    officialSources: [],
  },
];
