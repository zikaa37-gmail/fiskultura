import { IconName } from '../shared/icon/icon';

export const FOUNDING_CHECKED_AT = '2026-11-10';

const ASSOCIATIONS_ACT = 'https://www.paragraf.rs/propisi/zakon_o_udruzenjima.html';
const ACCOUNTING_ACT = 'https://www.paragraf.rs/propisi/zakon_o_racunovodstvu.html';
const OWNERS_ACT = 'https://www.paragraf.rs/propisi/zakon-o-centralnoj-evidenciji-stvarnih-vlasnika.html';

export interface FoundingRef {
  label: string;
  url: string;
}

export interface FoundingStep {
  title: string;
  text: string;
  ref?: FoundingRef;
}

export interface FoundingDocument {
  title: string;
  text: string;
  url: string;
  format: 'DOC' | 'PDF' | 'Stranica';
  icon: IconName;
  accent: 'primary' | 'lime' | 'orange' | 'sky' | 'violet' | 'rose';
}

export interface FoundingAct {
  title: string;
  note: string;
  url: string;
}

const article = (url: string, number: number, act: string): FoundingRef => ({ label: `${act}, član ${number}`, url: `${url}#clan_${number}` });

export const FOUNDING_STEPS: FoundingStep[] = [
  {
    title: 'Okupite bar troje kolega',
    text: 'Društvo osnivaju najmanje tri osnivača, a bar jedan mora da živi u Srbiji. Dovoljno je nekoliko nastavnika iz istog grada ili opštine.',
    ref: article(ASSOCIATIONS_ACT, 10, 'Zakon o udruženjima'),
  },
  {
    title: 'Izaberite naziv i sedište',
    text: 'Naziv mora biti na srpskom jeziku i ćirilici, npr. „Друштво педагога физичке културе Ваљево”. Sedište može biti adresa škole ili nekog od osnivača, uz njihovu saglasnost. Naziv možete i da rezervišete kod APR-a.',
    ref: article(ASSOCIATIONS_ACT, 13, 'Zakon o udruženjima'),
  },
  {
    title: 'Održite osnivačku skupštinu',
    text: 'Na skupštini usvajate osnivački akt i statut i birate zastupnika (obično predsednika društva). O svemu vodite zapisnik koji potpisuju predsedavajući i zapisničar.',
    ref: article(ASSOCIATIONS_ACT, 11, 'Zakon o udruženjima'),
  },
  {
    title: 'Statut: kratko i jasno',
    text: 'Statut opisuje ciljeve, članstvo, organe, način odlučivanja, finansije i prestanak rada. Obavezni organi su samo skupština i zastupnik. Upravni i nadzorni odbor možete dodati, ali za malo društvo nisu neophodni.',
    ref: article(ASSOCIATIONS_ACT, 12, 'Zakon o udruženjima'),
  },
  {
    title: 'Predajte prijavu APR-u',
    text: 'Šaljete registracionu prijavu osnivanja sa osnivačkim aktom, statutom, zapisnikom, odlukom o zastupniku, kopijom lične karte zastupnika i dokazom o uplati. APR odlučuje u roku od pet radnih dana, a uz rešenje dobijate i matični broj i PIB.',
  },
  {
    title: 'Naknada: 8.000 dinara',
    text: 'Upis osnivanja udruženja košta 8.000 dinara, uplata na račun APR-a 840-1308664-17, model 97, sa pozivom na broj iz APR-ovog generatora. Rezervacija naziva je 2.000 dinara.',
  },
];

export const AFTER_FOUNDING: FoundingStep[] = [
  {
    title: 'Račun u banci',
    text: 'Sa rešenjem APR-a otvarate tekući račun društva. Članarine i donacije idu preko računa, ne preko ličnih računa.',
  },
  {
    title: 'Stvarni vlasnici, 30 dana',
    text: 'Zastupnik u roku od 30 dana od upisa evidentira stvarne vlasnike društva u Centralnoj evidenciji kod APR-a.',
    ref: article(OWNERS_ACT, 8, 'Zakon o centralnoj evidenciji stvarnih vlasnika'),
  },
  {
    title: 'Evidencija članova',
    text: 'Društvo vodi spisak svojih članova. Dovoljna je jednostavna tabela sa imenom, školom i datumom učlanjenja.',
    ref: article(ASSOCIATIONS_ACT, 19, 'Zakon o udruženjima'),
  },
  {
    title: 'Završni račun do 31. marta',
    text: 'Svake godine do 31. marta APR-u se elektronski predaje godišnji finansijski izveštaj za prethodnu godinu. Ako društvo nije imalo nikakvog prometa, umesto izveštaja predaje se izjava o neaktivnosti.',
    ref: article(ACCOUNTING_ACT, 44, 'Zakon o računovodstvu'),
  },
  {
    title: 'Promene prijavite za 15 dana',
    text: 'Novi zastupnik, adresa ili izmene statuta prijavljuju se APR-u u roku od 15 dana od promene. Kasna prijava se plaća više.',
    ref: article(ASSOCIATIONS_ACT, 33, 'Zakon o udruženjima'),
  },
  {
    title: 'Izrada pečata (po želji)',
    text: 'Od 1. oktobra 2018. pečat nije obavezan, ali dobro dođe za dopise školama, opštini i konkursima. Skupština ili upravni odbor donese odluku o izgledu pečata (primer je ispod), a pečat izrađuje bilo koja radnja za izradu pečata. Ponesite rešenje APR-a i odluku. Naziv u pečatu piše se ćirilicom, tačno kako je upisan u registar. Ako statut opisuje pečat, pečat mora da odgovara statutu.',
  },
];

export const SEAL_TEMPLATE_TITLE = 'Одлука о изгледу и употреби печата';

export const SEAL_TEMPLATE: string[] = [
  'На основу члана ___ Статута Друштва педагога физичке културе ________ (у даљем тексту: Друштво), Скупштина Друштва на седници одржаној ___.___.______. године доноси',
  'ОДЛУКУ о изгледу и употреби печата',
  '1. Друштво има печат округлог облика, пречника ___ мм.',
  '2. По ободу печата исписан је назив Друштва, онако како је уписан у Регистар удружења, а у средини печата седиште Друштва.',
  '3. Печат се користи на актима, дописима и другим документима које потписује заступник Друштва.',
  '4. О чувању и употреби печата стара се заступник Друштва.',
  '5. Одлука ступа на снагу даном доношења.',
  'Председавајући Скупштине: ________________',
];

export const FOUNDING_DOCUMENTS: FoundingDocument[] = [
  {
    title: 'Primer osnivačkog akta',
    text: 'Odluka o osnivanju sa podacima o osnivačima, nazivu, sedištu i ciljevima.',
    url: 'https://www.apr.gov.rs/upload/Portals/0/udruzenja/2020/Primer_osnivackog_akta_udruzenja.doc',
    format: 'DOC',
    icon: 'clipboard',
    accent: 'primary',
  },
  {
    title: 'Primer statuta',
    text: 'Model statuta za osnivanje, sa skupštinom, zastupnikom i odborima.',
    url: 'https://www.apr.gov.rs/upload/Portals/0/udruzenja/2020/Primer_statuta_udruzenja__osnivanje_.doc',
    format: 'DOC',
    icon: 'book',
    accent: 'violet',
  },
  {
    title: 'Zapisnik sa osnivačke skupštine (1)',
    text: 'Primer zapisnika: dnevni red, usvajanje akata i izbor zastupnika.',
    url: 'https://www.apr.gov.rs/upload/Portals/0/udruzenja/Primer%201%20Zapsinik%20sa%20osnivacke%20skupstine%20udruzenja%20gradjana.doc',
    format: 'DOC',
    icon: 'checklist',
    accent: 'sky',
  },
  {
    title: 'Zapisnik sa osnivačke skupštine (2)',
    text: 'Drugi primer zapisnika, kraći oblik.',
    url: 'https://www.apr.gov.rs/upload/Portals/0/udruzenja/Primer%202%20Zapisnik%20sa%20osnivacke%20skupstine%20gradjana.doc',
    format: 'DOC',
    icon: 'checklist',
    accent: 'sky',
  },
  {
    title: 'Odluka o imenovanju zastupnika',
    text: 'Ko zastupa društvo pred APR-om, bankom i školama.',
    url: 'https://www.apr.gov.rs/upload/Portals/0/udruzenja/Primer%20%D0%9E%D0%B4%D0%BB%D1%83%D0%BA%D0%B0%20%D0%BE%20%D0%B8%D0%BC%D0%B5%D0%BD%D0%BE%D0%B2%D0%B0%D1%9A%D1%83%20%D0%B7%D0%B0%D1%81%D1%82%D1%83%D0%BF%D0%BD%D0%B8%D0%BA%D0%B0.doc',
    format: 'DOC',
    icon: 'user',
    accent: 'orange',
  },
  {
    title: 'Registraciona prijava osnivanja',
    text: 'Obrazac koji se predaje APR-u, zajedno sa podacima za PIB.',
    url: 'https://www.apr.gov.rs/upload/Portals/0/udruzenja/2023/JRPPS_Udruzenja_112023.pdf',
    format: 'PDF',
    icon: 'pdf',
    accent: 'rose',
  },
  {
    title: 'Rezervacija naziva',
    text: 'Ako želite da sačuvate naziv dok pripremate dokumenta.',
    url: 'https://www.apr.gov.rs/upload/Portals/0/Opsti%20obrasci%20za%20sve%20registre/2022/Prijava_za_REZERVACIJU_naziva.pdf',
    format: 'PDF',
    icon: 'pdf',
    accent: 'rose',
  },
  {
    title: 'Brošura za osnivače',
    text: 'Kancelarija za saradnju sa civilnim društvom: prava, obaveze i konkursi za finansiranje.',
    url: 'https://www.apr.gov.rs/upload/Portals/0/udruzenja/2020/Brosura/Brosura_Sta_bi_trebalo_da_znate_kada_osnivate_udruzenje__zaduzbinu_ili_fondaciju.pdf',
    format: 'PDF',
    icon: 'pdf',
    accent: 'lime',
  },
];

export const FOUNDING_LINKS: FoundingRef[] = [
  { label: 'APR: uputstvo za osnivanje udruženja', url: 'https://www.apr.gov.rs/registri/udruzenja/uputstva/osnivanje.2218.html' },
  { label: 'APR: svi obrasci i primeri akata', url: 'https://www.apr.gov.rs/registri/udruzenja/obrasci.2223.html' },
  { label: 'APR: naknade', url: 'https://www.apr.gov.rs/registri/udruzenja/naknade.4871.html' },
  { label: 'APR: generator poziva na broj', url: 'https://pretraga2.apr.gov.rs/GeneratorPozivaNaBroj/Home/' },
];

export const FOUNDING_ACTS: FoundingAct[] = [
  { title: 'Zakon o udruženjima', note: '„Sl. glasnik RS”, br. 51/2009, 99/2011 i 44/2018', url: ASSOCIATIONS_ACT },
  { title: 'Zakon o računovodstvu', note: '„Sl. glasnik RS”, br. 73/2019 i 44/2021', url: ACCOUNTING_ACT },
  { title: 'Zakon o centralnoj evidenciji stvarnih vlasnika', note: '„Sl. glasnik RS”, br. 19/2025, 51/2025 i 60/2025', url: OWNERS_ACT },
];
