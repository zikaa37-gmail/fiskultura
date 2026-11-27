import { IconName } from '../../shared/icon/icon';
import { ModuleAccent } from '../portal-content';
import { InstitutionContact } from './contacts';

export interface LegalLink {
  label: string;
  url: string;
}

export interface ContactGuide {
  id: string;
  title: string;
  short: string;
  icon: IconName;
  accent: ModuleAccent;
  intro: string;
  contactWhen: string[];
  notFor: string[];
  steps?: string[];
  include?: string[];
  legal: LegalLink[];
}

const ZOSOV = 'https://www.paragraf.rs/propisi/zakon_o_osnovama_sistema_obrazovanja_i_vaspitanja.html';
const ZPI = 'https://www.paragraf.rs/propisi/zakon-o-prosvetnoj-inspekciji-republike-srbije.html';
const ZIN = 'https://www.paragraf.rs/propisi/zakon_o_inspekcijskom_nadzoru.html';

export const COMPLAINT_STEPS = [
  'Prvo pisano školi: direktoru, preko sekretara škole. Sačuvajte primerak sa brojem i datumom.',
  'Ako škola ne odgovori ili odgovor nije dobar: prosvetnom inspektoru u opštini ili gradu, uz dopis školi i odgovor.',
  'Ako ni to ne reši stvar, ili opština nema inspektora: Ministarstvu prosvete (Sektor za inspekcijske poslove), sa svom dokumentacijom. U Vojvodini pokrajinskoj prosvetnoj inspekciji.',
];

export const CONTACT_GUIDES: ContactGuide[] = [
  {
    id: 'skolska-uprava',
    title: 'Školska uprava',
    short: 'Stručna podrška, uslovi za nastavu, zvanja',
    icon: 'book',
    accent: 'primary',
    intro:
      'Deo Ministarstva prosvete u vašem okrugu. Ne kažnjava škole, nego prati i unapređuje njihov rad: stručno-pedagoški nadzor, spoljašnje vrednovanje, stručno usavršavanje i razvojno planiranje. Tu rade prosvetni savetnici. Pišite mejlom ili dopisom: navedite školu, predmet (fizičko vaspitanje) i šta vam treba.',
    contactWhen: [
      'treba vam stručni savet ili tumačenje programa',
      'škola ne obezbeđuje uslove za nastavu (sala, oprema) i to utiče na kvalitet rada',
      'tražite proveru za zvanje (pedagoški savetnik i više)',
      'hoćete da ukažete na problem u radu škole koji nije čisto pravni',
      'tražite informacije o stručnom usavršavanju',
    ],
    notFor: [
      'plate, ugovore i otkaze (školski odbor, sud, inspekcija rada)',
      'hitnu zakonsku meru protiv škole (prosvetna inspekcija)',
      'povrede na radu i bezbednost sale (inspekcija rada)',
    ],
    legal: [
      { label: 'ZOSOV, čl. 31 i 170–173', url: ZOSOV },
    ],
  },
  {
    id: 'prosvetni-savetnik',
    title: 'Prosvetni savetnik',
    short: 'Kvalitet nastave, savet, ogledni čas',
    icon: 'people',
    accent: 'violet',
    intro:
      'Vrši stručno-pedagoški nadzor: gleda kvalitet nastave i rada škole, ne samo da li je poštovan zakon. Prisustvuje časovima, savetuje nastavnike i direktore, procenjuje uslove za zvanje i predlaže mere. Ako uoči nepravilnost, ne kažnjava sam, nego pokreće inspekcijski nadzor. Postoje i savetnici – spoljni saradnici za predmete: nastavnici sa liste Ministarstva koji drže ogledne časove i daju preporuke.',
    contactWhen: [
      'treba vam podrška u planiranju i ocenjivanju iz fizičkog vaspitanja',
      'hoćete mišljenje o uslovima za nastavu',
      'konkurišete za zvanje',
      'tražite savet oko zaštite učenika od nasilja i diskriminacije',
      'mislite da se ciljevi programa u školi ne ostvaruju',
    ],
    notFor: ['poništavanje odluke direktora ili školskog odbora', 'radne sporove', 'prigovor na ocenu (ide direktoru)'],
    legal: [
      { label: 'ZOSOV, čl. 170–173', url: ZOSOV },
      { label: 'Zakon o prosvetnoj inspekciji, čl. 16', url: ZPI },
    ],
  },
  {
    id: 'opstinski-inspektor',
    title: 'Prosvetni inspektor u opštini ili gradu',
    short: 'Prva adresa kad škola prekrši propis',
    icon: 'checklist',
    accent: 'orange',
    intro:
      'Prva inspekcijska adresa kada škola prekrši propis, a direktor problem nije rešio. Nadzire primenu zakona u vrtićima, osnovnim i srednjim školama: prava učenika, roditelja i zaposlenih, zaštitu od nasilja i diskriminacije, upis, ispite, evidencije i javne isprave. Može da naloži otklanjanje nepravilnosti u roku, da zabrani nezakonitu radnju i da podnese prekršajnu ili krivičnu prijavu. Inspektor je u opštinskoj ili gradskoj upravi (više opština može imati zajedničkog), a spisak opština koje ga imaju je na sajtu Ministarstva.',
    contactWhen: [
      'škola ne primenjuje zakon ili svoj opšti akt',
      'povređeno je vaše pravo iz propisa o obrazovanju',
      'škola ne štiti učenike ili zaposlene od nasilja i diskriminacije',
      'ima nepravilnosti u evidenciji, ispitima, raspodeli časova ili javnim ispravama',
      'direktor ne odgovara na pisani zahtev',
    ],
    notFor: [
      'radne sporove i zaradu (posle žalbe školskom odboru ide sud, rok 30 dana)',
      'bezbednost i zdravlje na radu (inspekcija rada)',
      'kvalitet nastave i stručna pitanja (prosvetni savetnik)',
      'anonimne dojave bez podataka: predstavka mora imati podatke podnosioca',
    ],
    steps: COMPLAINT_STEPS,
    include: [
      'ime, prezime, adresu, telefon i mejl',
      'naziv škole',
      'jasan opis nepravilnosti i koje je pravo povređeno (propis i član nisu obavezni)',
      'priloge: dopis školi i njen odgovor',
    ],
    legal: [
      { label: 'Zakon o prosvetnoj inspekciji, čl. 5, 7, 15, 18', url: ZPI },
      { label: 'Zakon o inspekcijskom nadzoru, čl. 18 (rokovi: dopuna 8 dana, obaveštenje do 30 dana)', url: ZIN },
    ],
  },
  {
    id: 'republicka-inspekcija',
    title: 'Republička prosvetna inspekcija',
    short: 'Drugi nivo, žalba i pritužba na inspektora',
    icon: 'ban',
    accent: 'rose',
    intro:
      'Drugi nivo. Postupa kada niste zadovoljni odgovorom škole i lokalne inspekcije, kada vaša opština nema prosvetnog inspektora i po žalbi na rešenje opštinskog inspektora. Nadzire opštinske inspektore i može sama da vrši nadzor bilo gde u Srbiji. Na rad inspektora može se podneti pritužba; odgovor stiže u roku od 15 dana.',
    contactWhen: [
      'lokalni inspektor ne postupa ili niste zadovoljni ishodom (pošaljite svu dokumentaciju)',
      'vaša opština nema prosvetnog inspektora',
      'žalite se na rešenje opštinskog inspektora',
      'podnosite pritužbu na rad inspektora',
      'reč je o visokom obrazovanju, zavodima ili proveri diploma',
    ],
    notFor: [
      'prvi korak: ne preskačite školu i lokalnog inspektora',
      'radne sporove i naknadu štete (sud)',
      'bezbednost na radu (inspekcija rada)',
      'hitno nasilje (policija, 192); za savet: SOS telefon Ministarstva 0800 200 201',
    ],
    steps: COMPLAINT_STEPS,
    legal: [
      { label: 'Zakon o prosvetnoj inspekciji, čl. 17 i 18', url: ZPI },
      { label: 'Zakon o inspekcijskom nadzoru, čl. 18 i 52', url: ZIN },
      { label: 'ZOSOV, čl. 81 i 169', url: ZOSOV },
    ],
  },
];

export const LOCAL_INSPECTIONS: InstitutionContact[] = [
  {
    id: 'inspekcija-beograd',
    accent: 'orange',
    icon: 'checklist',
    name: 'Prosvetna inspekcija Grada Beograda',
    when: 'Sekretarijat za obrazovanje i dečju zaštitu, Sektor za inspekcijski nadzor.',
    address: 'Kraljice Marije 1, Beograd',
    lines: [
      { label: 'Prosvetna inspekcija', phone: '011/360-5671' },
      { label: 'Sekretarijat', email: 'obrazovanje@beograd.gov.rs' },
    ],
    url: 'https://www.beograd.rs/lat/gradska-uprava/a88207/Sekretarijat-za-obrazovanje-i-decju-zastitu.html',
    urlLabel: 'Sekretarijat',
  },
  {
    id: 'inspekcija-novi-sad',
    accent: 'orange',
    icon: 'checklist',
    name: 'Prosvetna inspekcija Grada Novog Sada',
    when: 'Gradska uprava za obrazovanje (povereni inspekcijski nadzor u osnovnim i srednjim školama).',
    address: 'Žarka Zrenjanina 2, Novi Sad',
    lines: [{ label: 'Gradska uprava za obrazovanje', phone: '021/4882-968', email: 'obrazovanje@uprava.novisad.rs' }],
    url: 'https://novisad.rs/lat/gradska-uprava-za-obrazovanje',
    urlLabel: 'Gradska uprava',
  },
  {
    id: 'inspekcija-pancevo',
    accent: 'orange',
    icon: 'checklist',
    name: 'Prosvetna inspekcija Grada Pančeva',
    when: 'Zmaj Jovina 6, kancelarija 101.',
    address: 'Zmaj Jovina 6, Pančevo',
    lines: [
      { label: 'Prosvetni inspektor', name: 'Miodrag Krudulj', phone: '013/354-171', email: 'miodrag.krudulj@pancevo.rs' },
      { label: 'Prosvetni inspektor', name: 'Sanja Maljković', email: 'sanja.maljkovic@pancevo.rs' },
    ],
    url: 'https://www.pancevo.rs/lokalna-samouprava/inspekcijski-poslovi/prosvetna-inspekcija/?pismo=lat',
    urlLabel: 'Sajt grada',
  },
  {
    id: 'inspekcija-zrenjanin',
    accent: 'orange',
    icon: 'checklist',
    name: 'Prosvetna inspekcija Grada Zrenjanina',
    when: 'Odeljenje inspekcija, Odsek za prosvetnu inspekciju.',
    lines: [
      { label: 'Odsek za prosvetnu inspekciju', phone: '023/3150-057' },
      { label: 'Odsek za prosvetnu inspekciju', phone: '023/3150-052' },
      { label: 'Odeljenje inspekcija', email: 'inspekcija@zrenjanin.rs' },
    ],
    url: 'https://zrenjanin.rs/gradska-vlast/gradska-uprava/organizacione-jedinice/odeljenje-inspekcija/',
    urlLabel: 'Sajt grada',
  },
  {
    id: 'inspekcija-novi-becej',
    accent: 'orange',
    icon: 'checklist',
    name: 'Prosvetna inspekcija Opštine Novi Bečej',
    when: 'Odeljenje za inspekcijske službe.',
    address: 'Žarka Zrenjanina 8, Novi Bečej',
    lines: [{ label: 'Prosvetni inspektor', name: 'Dragana Milošev', phone: '023/772-320' }],
    url: 'https://novibecej.rs/index.php/lat/o-nama/opstinska-uprava/osnovne-organizacione-jedinice/odeljenje-za-inspekcijske-sluzbe/prosvetna-inspekcija',
    urlLabel: 'Sajt opštine',
  },
  {
    id: 'inspekcija-zitiste',
    accent: 'orange',
    icon: 'checklist',
    name: 'Prosvetna inspekcija Opštine Žitište',
    when: 'Cara Dušana 15, kancelarija 24, prvi sprat.',
    address: 'Cara Dušana 15, Žitište',
    lines: [{ label: 'Prosvetni inspektor', name: 'Jelena Budimir', phone: '023/821-050' }],
    url: 'https://zitiste.rs/prosvetni-inspektor/',
    urlLabel: 'Sajt opštine',
  },
  {
    id: 'inspekcija-kosjeric',
    accent: 'orange',
    icon: 'checklist',
    name: 'Prosvetna inspekcija Opštine Kosjerić',
    when: 'Prosvetna inspekcija, inspekcija za sport i turistička inspekcija.',
    address: 'Olge Grbić 10, Kosjerić',
    lines: [{ label: 'Prosvetni inspektor', email: 'prosvetni.inspektor@kosjeric.rs' }],
    url: 'https://www.kosjeric.rs/kontakt/',
    urlLabel: 'Sajt opštine',
  },
];

export const LOCAL_INSPECTIONS_NOTE =
  'Svaka opština ili grad ima prosvetnog inspektora (ili zajedničkog sa susednim opštinama) u opštinskoj upravi, obično u odeljenju za inspekcije ili društvene delatnosti. Najbrže ga nađete na sajtu opštine (Opštinska uprava → Inspekcije) ili preko centrale opštine. Ako vaša opština nije na spisku Ministarstva, predstavka ide Ministarstvu, a u Vojvodini pokrajinskom sekretarijatu.';

export const LOCAL_INSPECTIONS_URL = 'https://prosveta.gov.rs/prosvetna-inspekcija/podnosenje-predstavki-prosvetnoj-inspekciji/';
