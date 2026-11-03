import { IconName } from '../shared/icon/icon';

export type ModuleStatus = 'ready' | 'first' | 'soon';

export type ModuleAccent = 'primary' | 'lime' | 'orange' | 'sky' | 'violet' | 'rose';

export interface PortalModule {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  accent: ModuleAccent;
  status: ModuleStatus;
  statusLabel: string;
  route?: string;
  href?: string;
}

export interface PortalApp {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: IconName;
  accent: ModuleAccent;
  owner: string;
}

export interface Exercise {
  name: string;
  meta: string;
  description: string;
  steps: string[];
}

export const APP_LINKS = {
  ePripreme: 'https://e-pripreme.fiskultura.rs/',
  evidencija: 'https://evidencija.fiskultura.rs/',
  jadzent: 'https://jadzent.fiskultura.rs/',
  zdravitas: 'https://admin.zdravitas.gov.rs/',
} as const;

export const PORTAL_MODULES: PortalModule[] = [
  {
    id: 'news',
    title: 'Vesti i objave',
    description: 'Školski sport, propisi, seminari, konkursi i saopštenja — sve što se dešava u fizičkom vaspitanju u Srbiji.',
    icon: 'news',
    accent: 'primary',
    status: 'first',
    statusLabel: 'Prvo izdanje',
    route: '/vesti',
  },
  {
    id: 'organizations',
    title: 'Strukovna udruženja',
    description: 'Društva pedagoga fizičke kulture i savezi za školski sport u celoj Srbiji, sa sajtovima i objavama.',
    icon: 'people',
    accent: 'violet',
    status: 'first',
    statusLabel: 'Prvo izdanje',
    route: '/udruzenja',
  },
  {
    id: 'sports',
    title: 'Sportovi i pravila',
    description: 'Pravila za košarku, odbojku, rukomet, mali fudbal, atletiku, gimnastiku, elementarne igre i plesove — za čas, ne za ligu.',
    icon: 'globe',
    accent: 'sky',
    status: 'first',
    statusLabel: 'Prvo izdanje',
    route: '/sportovi',
  },
  {
    id: 'guides',
    title: 'Slikovita PDF uputstva',
    description: 'Uputstvo za igru po sportu na nekoliko strana A4, sa crtežima — za štampu, oglasnu tablu ili učenike.',
    icon: 'pdf',
    accent: 'orange',
    status: 'soon',
    statusLabel: 'Uskoro',
    route: '/sportovi',
  },
  {
    id: 'help',
    title: 'Stručna pomoć',
    description: 'Stručni tekstovi, administracija (dnevnik, ocenjivanje, planovi), pravna pitanja i predlozi za bolju nastavu.',
    icon: 'book',
    accent: 'rose',
    status: 'soon',
    statusLabel: 'Uskoro',
  },
  {
    id: 'notifications',
    title: 'Obaveštenja mejlom',
    description: 'Izaberi šta pratiš — vesti, udruženja, svoj okrug — i dobijaj obaveštenja odmah ili jednom nedeljno.',
    icon: 'mail',
    accent: 'lime',
    status: 'soon',
    statusLabel: 'Uskoro',
  },
  {
    id: 'exercises',
    title: 'Baza vežbi',
    description: 'Vežbe sa slikom ili animacijom, filtrirane po uzrastu, delu tela, sportu i opremi koju sala stvarno ima.',
    icon: 'dumbbell',
    accent: 'primary',
    status: 'ready',
    statusLabel: 'U e-pripremama →',
    href: APP_LINKS.ePripreme,
  },
  {
    id: 'lessons',
    title: 'Pripreme za čas',
    description: 'Godišnji i mesečni plan, pripreme za čas iz baze vežbi (uvodni, pripremni, glavni, završni deo), štampa na 1–2 strane.',
    icon: 'clipboard',
    accent: 'lime',
    status: 'ready',
    statusLabel: 'Otvori e-pripreme →',
    href: APP_LINKS.ePripreme,
  },
  {
    id: 'attendance',
    title: 'Evidencija na času',
    description: 'Odeljenja, prisustvo i napomene po učeniku, izveštaji — evidencija fizičkog vaspitanja u školi.',
    icon: 'checklist',
    accent: 'violet',
    status: 'ready',
    statusLabel: 'Otvori evidenciju →',
    href: APP_LINKS.evidencija,
  },
  {
    id: 'testing',
    title: 'Testiranje fizičkih sposobnosti',
    description: 'Merenja se unose u državni portal Zdravitas; ovde stižu protokoli testova, norme i saveti za izvođenje.',
    icon: 'chart',
    accent: 'orange',
    status: 'ready',
    statusLabel: 'Zdravitas →',
    href: APP_LINKS.zdravitas,
  },
  {
    id: 'competitions',
    title: 'Školska takmičenja',
    description: 'Kalendar opštinskih, okružnih i republičkih takmičenja, propozicije i rezultati na jednom mestu.',
    icon: 'trophy',
    accent: 'violet',
    status: 'soon',
    statusLabel: 'Uskoro',
  },
  {
    id: 'home-workout',
    title: 'Vežbaj kod kuće',
    description: 'Kratki programi za učenike i porodicu: 10 minuta dnevno, bez opreme, sa izazovima za celo odeljenje.',
    icon: 'heart',
    accent: 'rose',
    status: 'soon',
    statusLabel: 'Uskoro',
  },
];

export const PORTAL_APPS: PortalApp[] = [
  {
    id: 'e-pripreme',
    name: 'e-pripreme',
    description: 'Vežbe sa slikama, godišnji i mesečni plan, pripreme za čas i šabloni za 5–8. razred OŠ i srednju školu.',
    url: APP_LINKS.ePripreme,
    icon: 'clipboard',
    accent: 'lime',
    owner: 'Fiskultura',
  },
  {
    id: 'evidencija',
    name: 'Evidencija FV',
    description: 'Evidencija učenika na časovima fizičkog vaspitanja: odeljenja, prisustvo, pohvale i opomene, izveštaji.',
    url: APP_LINKS.evidencija,
    icon: 'checklist',
    accent: 'violet',
    owner: 'Fiskultura',
  },
  {
    id: 'jadzent',
    name: 'Jadžent',
    description: 'Sport nastao u Temerinu 1993. u kom dečaci i devojčice igraju potpuno ravnopravno — pravila, novosti i galerija.',
    url: APP_LINKS.jadzent,
    icon: 'ball',
    accent: 'sky',
    owner: 'Fiskultura',
  },
  {
    id: 'zdravitas',
    name: 'Zdravitas',
    description: 'Državni portal za unos rezultata merenja fizičkih sposobnosti učenika.',
    url: APP_LINKS.zdravitas,
    icon: 'chart',
    accent: 'orange',
    owner: 'Ministarstvo prosvete',
  },
];

export const EXERCISES: Exercise[] = [
  {
    name: 'Čučanj uz zid',
    meta: 'Noge · bez opreme · 5–8 razred',
    description: 'Jača butine i zadnjicu, uči pravilan položaj kolena.',
    steps: [
      'Leđa naslonjena na zid, stopala u širini kukova, pola koraka od zida.',
      'Spusti se dok kolena ne budu pod pravim uglom, kolena iznad članaka.',
      'Zadrži 20–30 sekundi, odmori 30 sekundi. Ponovi 3 puta.',
    ],
  },
  {
    name: 'Plank na podlakticama',
    meta: 'Trup · strunjača · 3–8 razred',
    description: 'Jača mišiće trupa koji drže pravilno držanje tela.',
    steps: [
      'Podlaktice na podu, laktovi ispod ramena.',
      'Telo u pravoj liniji od glave do peta, pogled u pod.',
      'Zadrži 15–40 sekundi bez spuštanja kukova. Ponovi 3 puta.',
    ],
  },
  {
    name: 'Skokovi preko linije',
    meta: 'Brzina i koordinacija · bez opreme · 1–8 razred',
    description: 'Zagrevanje koje podiže puls i uči brzu promenu pravca.',
    steps: [
      'Stani bočno pored linije na podu sale.',
      'Sunožno skači levo-desno preko linije, što brže i niže.',
      '3 serije po 20 sekundi, između serija 40 sekundi hoda.',
    ],
  },
  {
    name: 'Most na leđima',
    meta: 'Zadnja loža i leđa · strunjača · 3–8 razred',
    description: 'Jača zadnji lanac mišića i rasterećuje donja leđa.',
    steps: [
      'Lezi na leđa, kolena savijena, stopala na podu u širini kukova.',
      'Podigni kukove dok telo od ramena do kolena ne bude prava linija.',
      'Zadrži 2 sekunde gore, polako spusti. 3 serije po 10 ponavljanja.',
    ],
  },
  {
    name: 'Pretklon u sedu',
    meta: 'Gipkost · strunjača · 1–8 razred',
    description: 'Istezanje zadnje strane nogu za završni deo časa.',
    steps: [
      'Sedi, noge opružene i spojene, stopala ka plafonu.',
      'Sa izdahom polako kreni rukama ka prstima, bez trzanja.',
      'Zadrži 20–30 sekundi u položaju blagog istezanja. Ponovi 2 puta.',
    ],
  },
];
