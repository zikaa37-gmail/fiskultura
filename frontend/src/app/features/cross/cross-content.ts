import { TestPicture, TestSource } from '../testing/testing-content';

export interface CrossBlock {
  title: string;
  items: string[];
  note?: string;
  sources: TestSource[];
}

export interface CrossSection {
  id: string;
  tab: string;
  title: string;
  lead: string;
  picture?: TestPicture;
  blocks: CrossBlock[];
}

const PROGRAM_FIRST_GRADE: TestSource = {
  title: 'Pravilnik o planu nastave i učenja za prvi ciklus osnovnog obrazovanja i programu nastave i učenja za prvi razred (Fizičko i zdravstveno vaspitanje — aktivnosti u prirodi)',
  publisher: 'Prosvetni glasnik 10/2017 (kopija na sajtu škole)',
  year: '2017',
  url: 'http://brankoradicevic-nbgd.edu.rs/wp-content/uploads/dokumenta/pravilnik1.pdf',
  pages: 'str. 38',
};

const FSFV_NS_SLIDES: TestSource = {
  title: 'Fizičko i zdravstveno vaspitanje u aktuelnim nastavnim planovima i programima (nastavni materijal fakulteta)',
  publisher: 'Fakultet sporta i fizičkog vaspitanja, Novi Sad',
  year: '2025',
  url: 'https://tabla.fsfvns.edu.rs/wp-content/uploads/2025/09/Физичко-васпитање-у-основној-и-средњој-школи.pdf',
  pages: 'slajd 17',
};

const ZUOV_SAFETY: TestSource = {
  title: 'Stručno uputstvo o bezbednoj realizaciji nastave i učenja fizičkog i zdravstvenog vaspitanja u osnovnom i srednjem obrazovanju i vaspitanju',
  publisher: 'Zavod za unapređivanje obrazovanja i vaspitanja (ZUOV)',
  year: '2020',
  url: 'https://zuov.gov.rs/wp-content/uploads/2020/07/Strucno-uputstvo-o-bezbednosti-FIZV.pdf',
  pages: 'str. 5–6',
};

const KROS_RTS_34: TestSource = {
  title: '34. Kros RTS-a „Kroz Srbiju" — plan i izveštaj sa trke',
  publisher: 'krosrts.rs',
  year: '2024',
  url: 'http://krosrts.rs/poceo-je-34-kros-rts-a-kroz-srbiju-najvece-kros-takmicenje-na-svetu/',
};

const KROS_RTS_2025: TestSource = {
  title: 'Obaveštenje: u 2025. godini Kros RTS-a nije održan',
  publisher: 'krosrts.rs',
  year: '2025',
  url: 'http://krosrts.rs/obavestenje-2/',
};

const NEKA_TRCI_SRBIJA: TestSource = {
  title: '„Neka trči Srbija" — štafetno miks trčanje učenika osnovnih škola',
  publisher: 'krosrts.rs',
  year: '2026',
  url: 'http://krosrts.rs/neka-trci-srbija-2/',
};

const SSS_COMPETITIONS: TestSource = {
  title: 'Pravilnik o organizaciji školskih sportskih takmičenja',
  publisher: 'Savez za školski sport Srbije',
  year: '2018',
  url: 'http://maja.skolskisportsrbije.org.rs/wp-content/uploads/2022/08/pravilnik_o_organizaciji_skolskih_sportskih_takmicenja_2018-.pdf',
  pages: 'čl. 5, 6, 9, 11, 13',
};

const SSS_MEDICAL: TestSource = {
  title: 'Pravilnik o medicinskoj zaštiti na školskim sportskim takmičenjima',
  publisher: 'Savez za školski sport Srbije',
  year: '2018',
  url: 'http://maja.skolskisportsrbije.org.rs/wp-content/uploads/2022/08/pravilnik_o_medicinskoj_zastiti.pdf',
  pages: 'čl. 3, 6',
};

const SSS_ATHLETICS: TestSource = {
  title: 'Propozicije školskih takmičenja — atletika 2026/27',
  publisher: 'Savez za školski sport Srbije',
  year: '2026',
  url: 'https://urhmvancibyfzcalwgzn.supabase.co/storage/v1/object/public/news-media/editorial/902b3758-af46-4f4b-9010-35b5bc399723.pdf',
};

const SAS_CROSS: TestSource = {
  title: 'Raspis — Prvenstvo Srbije u krosu (takmičenje atletskog saveza, nije školsko)',
  publisher: 'Srpski atletski savez',
  year: '2025',
  url: 'https://sas.rs/wp-content/uploads/2025/10/RASPIS-PS-u-krosu.pdf',
  pages: 'str. 1–2',
};

export const CROSS_SECTIONS: CrossSection[] = [
  {
    id: 'school',
    tab: 'Kros u školi',
    title: 'Organizacija krosa u školi',
    lead: 'Kros je deo programa fizičkog i zdravstvenog vaspitanja kao aktivnost u prirodi. Organizuje se najmanje jednom u školskoj godini, iz fonda radnih dana predviđenih planom, a datum se određuje godišnjim planom rada škole.',
    picture: 'cross-course',
    blocks: [
      {
        title: 'Šta propisuje program',
        items: [
          'Kros se organizuje najmanje jednom u toku školske godine, iz fonda radnih dana predviđenih zajedničkim planom (program za 1. razred; isto stoji i u programu za 3. razred).',
          'U programu za 5–8. razred i za srednju školu navodi se prolećni kros; dužinu staze određuje stručno veće nastavnika fizičkog i zdravstvenog vaspitanja.',
          'Pravilnik o kalendaru obrazovno-vaspitnog rada ne određuje dan krosa — datum se upisuje u godišnji plan rada škole.',
        ],
        note: 'Zvanične dužine staze po razredu i polu nisu propisane; određuje ih stručno veće škole.',
        sources: [PROGRAM_FIRST_GRADE, FSFV_NS_SLIDES],
      },
      {
        title: 'Ko planira i sprovodi',
        items: [
          'U prvom ciklusu (1–4. razred) kros zajedno planiraju i realizuju stručna veća razredne nastave i nastavnika fizičkog i zdravstvenog vaspitanja.',
          'U drugom ciklusu (5–8. razred) i u srednjoj školi kros planira i realizuje stručno veće nastavnika fizičkog i zdravstvenog vaspitanja.',
        ],
        sources: [ZUOV_SAFETY],
      },
      {
        title: 'Pre krosa',
        items: [
          'Roditelji su dužni da pisanim putem obaveste nastavnika o hroničnim zdravstvenim problemima učenika koji tokom krosa mogu da dovedu do zdravstvenog rizika.',
          'Škola obaveštava policijsku stanicu (preko školskog policajca) i dom zdravlja.',
          'Za aktivnosti u prirodi potrebna je pisana saglasnost roditelja, osim kad se kros održava u školi ili u njenoj neposrednoj blizini.',
          'Preporuka je da svaki učenik ponese flašicu vode koja ga čeka na cilju.',
        ],
        sources: [ZUOV_SAFETY],
      },
      {
        title: 'Na stazi',
        items: [
          'Nastavnici fizičkog vaspitanja i drugi nastavnici raspoređuju se na više mesta duž staze, da bi brzo reagovali u slučaju povrede ili pada učenika.',
          'Ako je kros u okolini škole (park, sportski teren, trim staza), nastavnici na stazi usmeravaju učenike na pravac kretanja prema cilju.',
        ],
        sources: [ZUOV_SAFETY],
      },
      {
        title: 'Predlog organizacije starta i cilja',
        items: [
          'Trke po razredima, posebno za učenike i učenice — tako škole organizuju i Kros RTS-a.',
          'Start sa široke linije, cilj u obliku levka da učenici prolaze jedan po jedan; jedan nastavnik meri vreme, drugi upisuje redosled dolaska.',
          'Zagrevanje pre trke i hodanje posle cilja, bez naglog sedanja.',
          'Učenici oslobođeni nastave fizičkog vaspitanja mogu da pomažu kao zapisničari i redari na stazi.',
        ],
        note: 'Ovo je predlog iz prakse, ne propis.',
        sources: [],
      },
    ],
  },
  {
    id: 'rts',
    tab: 'Kros RTS-a',
    title: 'Kros RTS-a „Kroz Srbiju" i „Neka trči Srbija"',
    lead: 'Kros RTS-a „Kroz Srbiju" bio je najveća školska kros priredba u zemlji, u saradnji sa Ministarstvom prosvete. U 2025. godini nije održan; njegov atletski deo nastavlja se kao štafetno takmičenje „Neka trči Srbija".',
    picture: 'relay',
    blocks: [
      {
        title: 'Kako je izgledao Kros RTS-a (34. kros, 17. maj 2024)',
        items: [
          'Predškolci i učenici trčali su istovremeno u svim mestima Srbije; start je dat iz studija RTS-a.',
          'Učestvovalo je oko 1.800 škola i 170 vrtića: dve trke za predškolce, 16 za osnovce i 8 za srednjoškolce. Škole su trčale po razredima, učenici i učenice posebno.',
          'Trčali su svi koji su to želeli, a nisu bili oslobođeni nastave fizičkog vaspitanja; staze su uglavnom bile u školskim dvorištima.',
          'Škole su rezultate slale školskim upravama Ministarstva, koje su ih zbirno prosleđivale Ministarstvu.',
        ],
        note: 'Zvanične dužine staza po kategorijama nismo našli objavljene.',
        sources: [KROS_RTS_34],
      },
      {
        title: '2025: Kros RTS-a nije održan',
        items: [
          'Prema obaveštenju organizatora od 17. decembra 2025, Kros RTS-a u 2025. nije održan.',
          'Obrazovni i umetnički delovi preneti su u projekat „Blago Srbije" (blagosrbije.rs), koji ima i atletski deo „Neka trči Srbija".',
        ],
        sources: [KROS_RTS_2025],
      },
      {
        title: '„Neka trči Srbija" 2026 — štafete osnovnih škola',
        items: [
          'Svaka škola prijavljuje dve mešovite štafete od po 8 učenika — po jedan učenik iz svakog razreda, naizmenično devojčica i dečak.',
          'Od 1. do 4. razreda izmene su po 200 m, od 5. do 8. razreda po 400 m.',
          'Finale je u Rekovcu, 28. novembra 2026. u 12 sati, za najviše 32 štafete: kvalifikovane sa „Blaga Srbije" i prve prijavljene školske štafete iz cele Srbije.',
          'Prijave do ponoći 26. novembra 2026, mejlom na blagosrb@gmail.com ili officekrosrts@gmail.com.',
        ],
        sources: [NEKA_TRCI_SRBIJA],
      },
    ],
  },
  {
    id: 'competition',
    tab: 'Školska takmičenja',
    title: 'Kros i takmičenja Saveza za školski sport',
    lead: 'Kros nije disciplina u sistemu školskih sportskih takmičenja Saveza za školski sport Srbije — nema ga u pravilniku ni na spisku sportova. Najbliže mu je školsko takmičenje u atletici; ispod su opšta pravila sistema i, radi orijentacije, kategorije krosa atletskog saveza.',
    blocks: [
      {
        title: 'Opšta pravila školskih takmičenja',
        items: [
          'Nivoi takmičenja: školsko, opštinsko (gradsko), okružno, međuokružno, državno i svetsko prvenstvo ISF; na viši nivo ide se preko nižeg.',
          'Takmiče se samo redovni učenici, sa overenom sportskom legitimacijom.',
          'Uzrast: 1–4. razred — 11 godina i mlađi u tekućoj školskoj godini; 5–6. razred — 13; 7–8. razred — 15; srednja škola 1–2. razred — 17, 3–4. razred — 19.',
          'Lekarski pregled ne stariji od 6 meseci; bez prisustva lekara takmičenje se ne može održati.',
        ],
        sources: [SSS_COMPETITIONS, SSS_MEDICAL],
      },
      {
        title: 'Atletika umesto krosa (propozicije 2026/27)',
        items: [
          'Ekipa ima do 10 takmičara — po jedan u disciplini, plus štafeta; bodovanje od 10 bodova za prvo do 1 boda za deseto mesto.',
          'Najduže trke: 600 m za 5–6. razred; 800 m za dečake i 600 m za devojčice 7–8. razreda; u srednjoj školi 1000 m za mladiće i 800 m za devojke.',
        ],
        sources: [SSS_ATHLETICS],
      },
      {
        title: 'Za orijentaciju: kros atletskog saveza (nije školsko takmičenje)',
        items: [
          'Mlađi pioniri / mlađe pionirke (godišta 2012–13): 1,5 km / 1 km.',
          'Stariji pioniri / starije pionirke (2010–11): 2 km / 1,5 km.',
          'Mlađi juniori / mlađe juniorke (2008–09): 6 km / 4 km.',
          'Ekipno: zbir plasmana tri najbolja takmičara kluba (1. mesto = 1 bod); pobeđuje najmanji zbir.',
        ],
        note: 'Ovo su kategorije Prvenstva Srbije u krosu 2025 Srpskog atletskog saveza — mogu da posluže stručnom veću pri određivanju dužine staze, ali ne važe za školski kros.',
        sources: [SAS_CROSS],
      },
    ],
  },
];
