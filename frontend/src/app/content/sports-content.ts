import { ModuleAccent, ModuleStatus } from './portal-content';

export type SportGroup = 'games' | 'athletics' | 'gymnastics' | 'elementary' | 'dance' | 'testing';

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
  pageLabel?: string;
}

export const SPORT_GROUPS: { id: SportGroup; title: string; description: string }[] = [
  { id: 'games', title: 'Sportske igre', description: 'Pravila prilagođena školskom času, kviz i PDF uputstvo.' },
  { id: 'athletics', title: 'Atletika', description: 'Discipline po fazama tehnike, česte greške, merenje.' },
  { id: 'gymnastics', title: 'Gimnastika', description: 'Elementi po spravama, metodski niz, čuvanje i pomaganje.' },
  { id: 'elementary', title: 'Elementarne igre i rekviziti', description: 'Igre za uvodni deo i završnicu časa i vežbe sa vijačom, obručem, lopticama i drugim rekvizitima, po uzrastu.' },
  { id: 'dance', title: 'Plesovi', description: 'Narodna kola i društveni plesovi iz programa.' },
  { id: 'testing', title: 'Testiranje i merenja', description: 'Protokoli testova, organizacija časa merenja i referentne vrednosti.' },
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
    status: 'ready',
    rulesPage: '/sportovi/odbojka',
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
    status: 'ready',
    rulesPage: '/sportovi/rukomet',
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
    status: 'ready',
    rulesPage: '/sportovi/mali-fudbal',
    officialSources: [{ label: 'Fudbalski savez Srbije — futsal', url: 'https://fss.rs/' }],
  },
  {
    slug: 'jadzent',
    name: 'Jadžent',
    group: 'games',
    summary: 'Srpski sport iz 1993. u kom dečaci i devojčice igraju ravnopravno — „brzo misli, brzo deluj, budi džentlmen".',
    accent: 'violet',
    status: 'ready',
    rulesPage: '/sportovi/jadzent',
    officialSources: [],
    externalSite: 'https://jadzent.fiskultura.rs/',
  },
  {
    slug: 'atletika',
    name: 'Atletika',
    group: 'athletics',
    summary: 'Trčanja, skokovi, bacanja i štafeta: tehnika po fazama, merenje i pravila takmičenja.',
    accent: 'orange',
    status: 'ready',
    rulesPage: '/sportovi/atletika',
    officialSources: [{ label: 'Atletski savez Srbije', url: 'https://www.ass.org.rs/' }],
  },
  {
    slug: 'kros',
    name: 'Školski kros',
    group: 'athletics',
    summary: 'Organizacija i bezbednost krosa u školi, Kros RTS-a i „Neka trči Srbija“, veza sa školskim takmičenjima.',
    accent: 'lime',
    status: 'first',
    rulesPage: '/sportovi/kros',
    pageLabel: 'Uputstvo za kros',
    officialSources: [],
  },
  {
    slug: 'gimnastika',
    name: 'Gimnastika',
    group: 'gymnastics',
    summary: 'Tlo, preskok, greda, vratilo, razboj, krugovi — elementi po razredu i mere sigurnosti.',
    accent: 'rose',
    status: 'ready',
    rulesPage: '/sportovi/gimnastika',
    officialSources: [],
  },
  {
    slug: 'elementarne-igre',
    name: 'Elementarne igre',
    group: 'elementary',
    summary: '„Između dve vatre", „Graničar", štafetne igre i igre hvatanja — po uzrastu i delu časa.',
    accent: 'lime',
    status: 'ready',
    rulesPage: '/sportovi/elementarne-igre',
    officialSources: [],
  },
  {
    slug: 'vezbe-sa-rekvizitima',
    name: 'Vežbe sa rekvizitima',
    group: 'elementary',
    summary: 'Vijača, obruč, loptice, palice, čunjevi i trake: vežbe pojedinačno, u paru i u grupi, za zagrevanje, poligone i igre.',
    accent: 'rose',
    status: 'ready',
    rulesPage: '/sportovi/vezbe-sa-rekvizitima',
    officialSources: [],
  },
  {
    slug: 'plesovi',
    name: 'Plesovi',
    group: 'dance',
    summary: 'Narodna kola i društveni plesovi: koraci po taktovima, muzika i video.',
    accent: 'violet',
    status: 'ready',
    rulesPage: '/sportovi/plesovi',
    officialSources: [],
  },
  {
    slug: 'testiranje',
    name: 'Testiranje fizičkih sposobnosti',
    group: 'testing',
    summary: 'Protokoli testova nacionalne baterije (Zdravitas) i stare baterije, oprema, organizacija časa i referentne vrednosti.',
    accent: 'orange',
    status: 'first',
    rulesPage: '/sportovi/testiranje',
    pageLabel: 'Uputstvo za merenja',
    officialSources: [{ label: 'Zdravitas', url: 'https://admin.zdravitas.gov.rs/' }],
  },
];
