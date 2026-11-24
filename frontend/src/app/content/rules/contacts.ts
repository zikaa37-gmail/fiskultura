import { ModuleAccent } from '../portal-content';
import { IconName } from '../../shared/icon/icon';

export interface ContactLine {
  label: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface InstitutionContact {
  id: string;
  name: string;
  accent: ModuleAccent;
  icon: IconName;
  when: string;
  address?: string;
  lines: ContactLine[];
  url: string;
  urlLabel: string;
}

export interface SchoolAdministration {
  city: string;
  area: string;
  address: string;
  phone: string;
  phones?: string[];
  email: string;
}

export const CONTACTS_CHECKED_AT = '2026-11-13';

export const INSTITUTION_CONTACTS: InstitutionContact[] = [
  {
    id: 'ministarstvo',
    accent: 'primary',
    icon: 'book',
    name: 'Ministarstvo prosvete',
    when: 'Planovi i programi, organizacija rada škole, nasilje i inkluzija, licenca, pravna tumačenja. Zahtevi i dopisi idu preko e-Pisarnice.',
    address: 'Nemanjina 22–26, 11000 Beograd',
    lines: [
      { label: 'Centrala', phone: '011/3613-734' },
      { label: 'Sektor za predškolsko i osnovno obrazovanje i vaspitanje', phone: '011/3622-317', email: 'osnovno@prosveta.gov.rs' },
      { label: 'Sektor za srednje obrazovanje i vaspitanje i obrazovanje odraslih', phone: '011/3616-524', email: 'srednje@prosveta.gov.rs' },
      { label: 'Sektor za prevenciju i zaštitu od nasilja i inkluziju', phone: '011/3619-526', email: 'zastitaodnasilja@prosveta.gov.rs' },
      { label: 'Odsek za pravne poslove', phone: '011/3610-351', email: 'odsekzapravneposlove@prosveta.gov.rs' },
      { label: 'Ispit za licencu, direktore i sekretare', phone: '011/2658-375' },
      { label: 'Informacije od javnog značaja', phone: '011/3671-104', email: 'informacijeodjavnogznacaja@prosveta.gov.rs' },
      { label: 'Lice za zaštitu podataka o ličnosti', email: 'zastitapodatakaolicnosti@prosveta.gov.rs' },
    ],
    url: 'https://prosveta.gov.rs/kontakt/',
    urlLabel: 'Kontakti Ministarstva',
  },
  {
    id: 'prosvetna-inspekcija',
    accent: 'rose',
    icon: 'checklist',
    name: 'Prosvetna inspekcija (Ministarstvo prosvete)',
    when: 'Drugi nivo: kad škola i opštinski inspektor nisu rešili problem, kad opština nema prosvetnog inspektora i za žalbu na rešenje opštinskog inspektora. Prvo pišite školi, pa opštinskom inspektoru.',
    address: 'Nemanjina 22–26, 11000 Beograd',
    lines: [
      { label: 'Sektor za inspekcijske poslove', phone: '011/2404-911' },
      { label: 'Inspekcija predškolskog, osnovnog i srednjeg obrazovanja i zavoda', phone: '011/2403-358' },
      { label: 'Inspekcija visokog obrazovanja i učeničkog i studentskog standarda', phone: '011/2401-838' },
      { label: 'Provera verodostojnosti diploma i svedočanstava', phone: '011/2424-087' },
      { label: 'Predstavke kad opština nema prosvetnog inspektora', email: 'prituzbe-prosvetnainspekcija@prosveta.gov.rs' },
      { label: 'Predstavke Republičkoj prosvetnoj inspekciji', email: 'prituzba-prosvetnainspekcija@prosveta.gov.rs' },
      { label: 'SOS telefon za nasilje u školi', phone: '0800 200 201' },
    ],
    url: 'https://prosveta.gov.rs/prosvetna-inspekcija/podnosenje-predstavki-prosvetnoj-inspekciji/',
    urlLabel: 'Kako se podnosi predstavka',
  },
  {
    id: 'zuov',
    accent: 'violet',
    icon: 'clipboard',
    name: 'Zavod za unapređivanje obrazovanja i vaspitanja (ZUOV)',
    when: 'Programi nastave i učenja, katalog stručnog usavršavanja i seminari, udžbenici, priručnici.',
    address: 'Fabrisova 10, 11040 Beograd',
    lines: [
      { label: 'Opšti kontakt', email: 'info@zuov.gov.rs' },
      { label: 'Kabinet direktora', phone: '011/206-80-05' },
      { label: 'Draže Pavlovića 15, Beograd', phone: '011/208-1916' },
    ],
    url: 'https://zuov.gov.rs/kontakt/',
    urlLabel: 'Kontakti i obrazac ZUOV-a',
  },
  {
    id: 'zvkov',
    accent: 'sky',
    icon: 'chart',
    name: 'Zavod za vrednovanje kvaliteta obrazovanja i vaspitanja (ZVKOV)',
    when: 'Standardi obrazovnih postignuća, završni ispit, praćenje fizičkog razvoja i motoričkih sposobnosti.',
    address: 'Fabrisova 10, 11040 Beograd',
    lines: [
      { label: 'Telefon', phone: '011/2067-000' },
      { label: 'Mobilni', phone: '064/866-50-23' },
      { label: 'Mejl', email: 'office@ceo.gov.rs' },
    ],
    url: 'https://ceo.edu.rs/7584-2/',
    urlLabel: 'Kontakt ZVKOV-a',
  },
  {
    id: 'pzv',
    accent: 'lime',
    icon: 'people',
    name: 'Pedagoški zavod Vojvodine',
    when: 'Stručna podrška školama u AP Vojvodini, programi na jezicima nacionalnih manjina.',
    address: 'Bulevar Mihajla Pupina 6/I, 21101 Novi Sad',
    lines: [
      { label: 'Telefon', phone: '021/4720-372' },
      { label: 'Mejl', email: 'office@pzv.org.rs' },
    ],
    url: 'https://pzv.org.rs/',
    urlLabel: 'Sajt Pedagoškog zavoda',
  },
  {
    id: 'inspekcija-rada',
    accent: 'rose',
    icon: 'heart',
    name: 'Inspektorat za rad',
    when: 'Bezbednost i zdravlje na radu (sala, sprave, povrede na radu) i radni odnosi zaposlenih.',
    address: 'Omladinskih brigada 1, Beograd',
    lines: [
      { label: 'Inspektorat', phone: '011/7455-991', email: 'inspekcija@minrzs.gov.rs' },
      { label: 'Info-centar, rad i inspekcija rada (radnim danima 7.30–15.30)', phone: '011/303-86-77' },
    ],
    url: 'https://www.minrzs.gov.rs/sr/kontakt',
    urlLabel: 'Kontakti Ministarstva za rad',
  },
  {
    id: 'poverenik',
    accent: 'violet',
    icon: 'help',
    name: 'Poverenik za informacije od javnog značaja i zaštitu podataka o ličnosti',
    when: 'Podaci o učenicima (merenja, zdravstveni podaci, fotografije) i pristup informacijama.',
    address: 'Bulevar kralja Aleksandra 15, 11120 Beograd',
    lines: [
      { label: 'Telefon', phone: '011/3408-900' },
      { label: 'Mejl', email: 'office@poverenik.rs' },
    ],
    url: 'https://poverenik.rs/kontakt/',
    urlLabel: 'Kontakt Poverenika',
  },
];

export const SCHOOL_ADMINISTRATIONS: SchoolAdministration[] = [
  { city: 'Beograd', area: 'Grad Beograd', address: 'Zahumska 14', phone: '011/3806-916', email: 'subeograd@prosveta.gov.rs', phones: ['011/2402-190', '011/2401-911 (lokali 220, 219)'] },
  { city: 'Valjevo', area: 'Kolubarski i Mačvanski okrug (i Šabac)', address: 'Karađorđeva 31', phone: '014/226-602', email: 'suvaljevo@prosveta.gov.rs', phones: ['014/221-284', '014/227-651'] },
  { city: 'Zaječar', area: 'Zaječarski i Borski okrug', address: 'Nikole Pašića 81', phone: '019/421-663', email: 'suzajecar@prosveta.gov.rs', phones: ['019/421-154'] },
  { city: 'Zrenjanin', area: 'Severnobanatski, Srednjebanatski i Južnobanatski okrug', address: 'Trg slobode 10', phone: '023/515-987', email: 'suzrenjanin@prosveta.gov.rs', phones: ['023/510-547'] },
  { city: 'Jagodina', area: 'Pomoravski okrug', address: 'TC Stara pošta 1/11', phone: '035/222-070', email: 'sujagodina@prosveta.gov.rs' },
  { city: 'Kosovska Mitrovica', area: 'Pećki, Prizrenski, Kosovsko-mitrovački, Kosovski i Kosovsko-pomoravski okrug', address: 'Džona Kenedija 17', phone: '028/424-359', email: 'sukosovskamitrovica@prosveta.gov.rs' },
  { city: 'Kragujevac', area: 'Šumadijski okrug', address: 'Save Kovačevića 7', phone: '034/336-023', email: 'sukragujevac@prosveta.gov.rs' },
  { city: 'Kraljevo', area: 'Raški okrug', address: 'Trg Jovana Sarića 3', phone: '036/308-706', email: 'sukraljevo@prosveta.gov.rs', phones: ['036/308-707'] },
  { city: 'Kruševac', area: 'Rasinski okrug', address: 'Balkanska 63', phone: '037/443-691', email: 'sukrusevac@prosveta.gov.rs', phones: ['037/443-692'] },
  { city: 'Leskovac', area: 'Jablanički i Pčinjski okrug', address: 'Blagoja Nikolića 1', phone: '016/255-452', email: 'suleskovac@prosveta.gov.rs', phones: ['016/212-464'] },
  { city: 'Niš', area: 'Nišavski, Toplički i Pirotski okrug', address: 'Strahinjića bana bb', phone: '018/505-107', email: 'sunis@prosveta.gov.rs', phones: ['018/505-150'] },
  { city: 'Novi Sad', area: 'Južnobački i Sremski okrug', address: 'Bulevar Mihajla Pupina 6', phone: '021/529-223', email: 'sunovisad@prosveta.gov.rs', phones: ['021/529-213'] },
  { city: 'Požarevac', area: 'Braničevski i Podunavski okrug', address: 'Drinska 2', phone: '012/511-680', email: 'supozarevac@prosveta.gov.rs' },
  { city: 'Sombor', area: 'Severnobački i Zapadnobački okrug', address: 'Trg cara Uroša 1', phone: '025/463-635', email: 'susombor@prosveta.gov.rs', phones: ['025/463-613', '025/463-634'] },
  { city: 'Užice', area: 'Zlatiborski okrug', address: 'Vidovdanska 34', phone: '031/513-092', email: 'suuzice@prosveta.gov.rs', phones: ['031/517-858'] },
  { city: 'Čačak', area: 'Moravički okrug', address: 'Cara Dušana bb', phone: '032/311-332', email: 'sucacak@prosveta.gov.rs', phones: ['032/341-166'] },
  { city: 'Novi Pazar (regionalna grupa)', area: 'Novi Pazar, Sjenica, Tutin', address: 'Šabana Koče 85', phone: '020/323-657', email: 'sunovipazar@prosveta.gov.rs' },
  { city: 'Subotica (regionalna grupa)', area: 'Subotica, Bačka Topola, Mali Iđoš, Ada, Senta, Kanjiža', address: 'Trg Lazara Nešića 1', phone: '024/555-152', email: 'grupasubotica@prosveta.gov.rs' },
];

export function telHref(phone: string): string {
  return `tel:+381${phone.replace(/\D/g, '').replace(/^0/, '')}`;
}

export interface EditorialMember {
  name: string;
  role: string;
  about: string;
  url?: string;
}

export const EDITORIAL_TEAM: EditorialMember[] = [
  {
    name: 'Igor Živanović',
    role: 'osnivač i urednik portala',
    about: 'Pravi portal Fiskultura i aplikacije za nastavu (e-pripreme, Evidencija FV, Jadžent) i uređuje propise, pitanja i odgovore.',
    url: '/portfolio/',
  },
];

export const CONTACT_TOPICS = [
  { id: 'pitanje', label: 'Pitanje uredništvu' },
  { id: 'greska', label: 'Greška ili zastarela informacija' },
  { id: 'predlog', label: 'Predlog teme ili sadržaja' },
  { id: 'saradnja', label: 'Saradnja (udruženje, škola, fakultet)' },
  { id: 'drugo', label: 'Drugo' },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]['id'];
