export type AthleticsPicture =
  | 'track-lanes'
  | 'lane-line-bad'
  | 'no-push'
  | 'start-marks'
  | 'start-set'
  | 'start-go'
  | 'start-standing'
  | 'start-standing-hand'
  | 'false-start'
  | 'start-steady'
  | 'start-game'
  | 'quiet-start'
  | 'finish-torso'
  | 'finish-hand'
  | 'finish-through'
  | 'sprint-60'
  | 'endurance-pace'
  | 'endurance-600-800'
  | 'cooldown-walk'
  | 'relay-team'
  | 'relay-zone'
  | 'relay-outside'
  | 'relay-pass'
  | 'relay-drop'
  | 'lj-takeoff'
  | 'lj-foul'
  | 'lj-measure'
  | 'lj-fall-back'
  | 'hj-one-foot'
  | 'hj-bar-falls'
  | 'hj-three'
  | 'hj-landing'
  | 'shot-neck'
  | 'shot-push'
  | 'shot-circle'
  | 'shot-sector'
  | 'shot-leave'
  | 'ball-hold'
  | 'ball-foot'
  | 'ball-line'
  | 'ball-best'
  | 'safety-sector'
  | 'safety-carry'
  | 'safety-warmup'
  | 'safety-pit'
  | 'compare-self';

export type RuleVerdict = 'ok' | 'bad' | null;

export type RuleFocus = [number, number, number];

export interface RuleFrame {
  picture?: AthleticsPicture;
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
  picture?: AthleticsPicture;
  image?: string;
  frames: RuleFrame[];
  question: { text: string; answer: string };
}

export interface QuizQuestion {
  text: string;
  picture?: AthleticsPicture;
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
  format: 'PDF' | 'DOCX' | 'sajt';
}

export interface RuleDocumentGroup {
  title: string;
  description: string;
  documents: RuleDocument[];
}

export const RULE_CARDS: RuleCard[] = [
  {
    id: 'lanes',
    title: 'Staza i trkačke staze',
    picture: 'track-lanes',
    frames: [
      { picture: 'track-lanes', caption: 'Svako u svojoj stazi', verdict: 'ok', info: 'U trkama do 400 m svaki trkač ima svoju stazu, široku 1,22 m. U njoj trči od starta do cilja.' },
      { picture: 'lane-line-bad', caption: 'Linija u krivini', verdict: 'bad', info: 'U krivini ne smeš da staneš na liniju sa leve strane svoje staze, niti unutar nje. To je prekršaj koji sudije prijavljuju.' },
      { picture: 'no-push', caption: 'Bez guranja', verdict: 'bad', info: 'Trkač koji gura ili ometa drugog trkača može biti diskvalifikovan.' },
    ],
    question: { text: 'U trci na 100 m pređeš u susednu stazu. Sme li to?', answer: 'Ne — trčiš u svojoj stazi do cilja.' },
  },
  {
    id: 'crouch-start',
    title: 'Niski start',
    picture: 'start-set',
    frames: [
      { picture: 'start-marks', caption: '„Na mesta“', verdict: null, info: 'Na komandu „Na mesta“ prilaziš liniji. Obe šake i bar jedno koleno su na tlu, stopala u startnom bloku. Šake su iza linije — ne na njoj.' },
      { picture: 'start-set', caption: '„Pozor“', verdict: null, info: 'Na „Pozor“ podigneš koleno: kukovi su malo iznad ramena, težina na rukama i prednjoj nozi. Šake i stopala ostaju na mestu i miruješ.' },
      { picture: 'start-go', caption: 'Pucanj — kreni!', verdict: 'ok', info: 'Na pucanj se snažno odgurneš obema nogama, energično radiš rukama i telo uspravljaš postepeno, ne odmah.' },
    ],
    question: { text: 'Koja komanda dolazi posle „Na mesta“?', answer: '„Pozor“ — pa pucanj.' },
  },
  {
    id: 'standing-start',
    title: 'Visoki start',
    picture: 'start-standing',
    frames: [
      { picture: 'start-standing', caption: 'Trke duže od 400 m', verdict: null, info: 'U trkama dužim od 400 m start je iz stojećeg stava (visoki start). Starter kaže samo „Na mesta“, pa puca.' },
      { picture: 'start-standing-hand', caption: 'Ruke ne na tlo', verdict: 'bad', info: 'U visokom startu ne smeš da dodirneš tlo rukom, a stopalima ne smeš na liniju ni ispred nje.' },
    ],
    question: { text: 'Koliko komandi ima start trke na 800 m?', answer: 'Jednu — „Na mesta“, pa pucanj.' },
  },
  {
    id: 'false-start',
    title: 'Pogrešan start',
    picture: 'false-start',
    frames: [
      { picture: 'false-start', caption: 'Krenuo pre pucnja', verdict: 'bad', info: 'Ko krene pre pucnja, napravio je pogrešan start. Po pravilima Svetske atletike takav takmičar se diskvalifikuje (osim u višeboju).' },
      { picture: 'start-steady', caption: 'Starter čeka mir', verdict: 'ok', info: 'Starter puca tek kada su svi mirni u startnom stavu. Zato čekaj pucanj — ne pogađaj kada će doći.' },
      { picture: 'start-game', caption: 'Igra: samo na START', verdict: 'ok', info: 'Igra na času: nastavnik kaže „Pripremi se, pozor…“, pa ponekad sličnu reč (STRELA, STAN). Kreće se samo na reč START!' },
    ],
    question: { text: 'Šta se dešava sa trkačem koji krene pre pucnja?', answer: 'Pogrešan start — diskvalifikuje se.' },
  },
  {
    id: 'finish',
    title: 'Cilj',
    picture: 'finish-torso',
    frames: [
      { picture: 'finish-torso', caption: 'Računa se trup', verdict: 'ok', info: 'Poredak na cilju određuje trenutak kada trup stigne do ivice ciljne linije. Ne računaju se glava, vrat, ruke, noge, šake ni stopala.' },
      { picture: 'finish-hand', caption: 'Ruka se ne računa', verdict: 'bad', info: 'Ako pružiš ruku preko linije, to ništa ne znači — dok trup ne stigne do linije, nisi u cilju.' },
      { picture: 'finish-through', caption: 'Trči kroz cilj', verdict: 'ok', info: 'Ne usporavaj pred linijom: trči kroz cilj. Zato prostor iza cilja mora da bude slobodan.' },
    ],
    question: { text: 'Koji deo tela odlučuje ko je prvi na cilju?', answer: 'Trup.' },
  },
  {
    id: 'sprint-endurance',
    title: 'Sprint i istrajno trčanje',
    picture: 'sprint-60',
    frames: [
      { picture: 'sprint-60', caption: 'Sprint 60 m', verdict: null, info: 'Sprint je kratka trka punom brzinom iz niskog starta. U 7. i 8. razredu trči se 60 m na vreme.' },
      { picture: 'endurance-pace', caption: 'Ravnomeran tempo', verdict: 'ok', info: 'U dužim trkama ne kreći prebrzo. Trči ravnomerno, a ubrzaj tek u poslednjih 100–150 m.' },
      { picture: 'endurance-600-800', caption: '600 m i 800 m', verdict: null, info: 'U 7. i 8. razredu učenice trče 600 m, a učenici 800 m, iz visokog starta.' },
      { picture: 'cooldown-walk', caption: 'Posle cilja — hodaj', verdict: 'ok', info: 'Posle trke ne staj naglo i ne sedaj odmah: hodaj 2–3 minuta.' },
    ],
    question: { text: 'Kada ubrzavaš u trci na 800 m?', answer: 'Na kraju, u poslednjih 100–150 m.' },
  },
  {
    id: 'relay',
    title: 'Štafeta',
    picture: 'relay-pass',
    frames: [
      { picture: 'relay-team', caption: 'Četiri trkača, jedna palica', verdict: null, info: 'U štafeti trče četiri trkača i jedan drugom predaju palicu. U školi se trči štafeta 4 × 60 m.' },
      { picture: 'relay-zone', caption: 'Zona za izmenu 30 m', verdict: null, info: 'Palica se predaje u zoni za izmenu. U štafeti 4 × 100 m ta zona je duga 30 m.' },
      { picture: 'relay-pass', caption: '„Hop!“ — donjim lukom', verdict: 'ok', info: 'Primač kreće kad predavač pretrči kontrolnu oznaku. Na „hop“ pruži ruku nazad, a predavač mu donjim lukom stavi palicu u šaku.' },
      { picture: 'relay-outside', caption: 'Predaja van zone', verdict: 'bad', info: 'Važno je gde je palica, a ne gde su noge trkača. Ako se palica preda van zone, ekipa se diskvalifikuje.' },
      { picture: 'relay-drop', caption: 'Ispala palica', verdict: null, info: 'Ako palica ispadne, mora da je podigne trkač koji ju je ispustio.' },
    ],
    question: { text: 'Ko podiže palicu koja je ispala?', answer: 'Trkač koji ju je ispustio.' },
  },
  {
    id: 'long-jump',
    title: 'Skok udalj',
    picture: 'lj-takeoff',
    frames: [
      { picture: 'lj-takeoff', caption: 'Zalet i odraz jednom nogom', verdict: 'ok', info: 'Posle ubrzanog zaleta odraziš se jednom nogom sa daske za odraz. Početnici na času mogu da se odražavaju iz zone odraza.' },
      { picture: 'lj-foul', caption: 'Prestup', verdict: 'bad', info: 'Ako pri odrazu vrhom stopala pređeš liniju odraza, to je prestup — pokušaj je neispravan i ne meri se.' },
      { picture: 'lj-measure', caption: 'Do najbližeg traga', verdict: null, info: 'Skok se meri od linije odraza do najbližeg traga u pesku koji je ostavio bilo koji deo tela.' },
      { picture: 'lj-fall-back', caption: 'Ne padaj nazad', verdict: 'bad', info: 'Ako pri doskoku padneš unazad i rukom dodirneš pesak, meri se taj bliži trag. Zato pri doskoku ruke idu napred!' },
    ],
    question: { text: 'Do kog traga u pesku se meri skok?', answer: 'Do najbližeg traga liniji odraza.' },
  },
  {
    id: 'high-jump',
    title: 'Skok uvis',
    picture: 'hj-bar-falls',
    frames: [
      { picture: 'hj-one-foot', caption: 'Odraz jednom nogom', verdict: 'ok', info: 'U skoku uvis odražavaš se jednom nogom — onom daljom od letvice.' },
      { picture: 'hj-bar-falls', caption: 'Letvica pala', verdict: 'bad', info: 'Ako letvica posle skoka ne ostane na nosačima zbog tvog skoka, pokušaj je neispravan.' },
      { picture: 'hj-three', caption: 'Tri neuspeha zaredom', verdict: 'bad', info: 'Na svakoj visini imaš do tri pokušaja. Posle tri uzastopna neispravna pokušaja takmičenje je za tebe završeno.' },
      { picture: 'hj-landing', caption: 'Meko doskočište', verdict: 'ok', info: 'Za opkoračnu i leđnu tehniku obavezno je doskočište od sunđera. Na skakalištu je uvek samo jedan skakač.' },
    ],
    question: { text: 'Posle koliko neuspeha zaredom skakač uvis završava takmičenje?', answer: 'Posle tri.' },
  },
  {
    id: 'shot-put',
    title: 'Bacanje kugle',
    picture: 'shot-push',
    frames: [
      { picture: 'shot-neck', caption: 'Kugla uz vrat', verdict: 'ok', info: 'Kugla se baca sa ramena jednom rukom. Na početku je uz vrat ili bradu i ne sme da ode iza linije ramena.' },
      { picture: 'shot-push', caption: 'Gura se, ne baca', verdict: 'ok', info: 'Kugla se „gura“ napred-gore. Prvo rade noge i kuk, pa ruka. U 7. razredu devojčice bacaju kuglu od 3 kg, a dečaci od 4 kg.' },
      { picture: 'shot-circle', caption: 'Krug 2,135 m', verdict: null, info: 'Baca se iz kruga prečnika 2,135 m. Dok bacaš, ne smeš da dodirneš vrh obruča ni tlo van kruga.' },
      { picture: 'shot-sector', caption: 'Kugla pada u sektor', verdict: 'ok', info: 'Kugla mora da padne unutar sektora. Ako padne na liniju sektora ili van nje, pokušaj je neispravan.' },
      { picture: 'shot-leave', caption: 'Izlaz kroz zadnju polovinu', verdict: 'ok', info: 'Iz kruga izlaziš tek kad kugla padne, i to kroz zadnju polovinu kruga. Izlazak napred je neispravan pokušaj.' },
    ],
    question: { text: 'Kada i kuda smeš da izađeš iz kruga?', answer: 'Kad kugla padne — kroz zadnju polovinu kruga.' },
  },
  {
    id: 'ball-throw',
    title: 'Bacanje loptice',
    picture: 'ball-hold',
    frames: [
      { picture: 'ball-hold', caption: 'Loptica iznad ramena', verdict: 'ok', info: 'Loptica je u savijenoj ruci iznad ramena. Pri bacanju ruka prolazi pored uha, a baca se „celim telom“ — počinje noga, pa kuk, pa ruka.' },
      { picture: 'ball-foot', caption: 'Suprotna noga napred', verdict: 'ok', info: 'Kad bacaš desnom rukom, leva noga je napred — i obrnuto.' },
      { picture: 'ball-line', caption: 'Linija se ne gazi', verdict: 'bad', info: 'Ako nagaziš ili pređeš liniju izbačaja, to je prestup i pokušaj je neuspešan.' },
      { picture: 'ball-best', caption: 'Računa se najbolji', verdict: null, info: 'Na času svako ima tri merena bacanja, a upisuje se najbolji rezultat.' },
    ],
    question: { text: 'Bacaš lopticu desnom rukom. Koja noga je napred?', answer: 'Leva.' },
  },
  {
    id: 'safety',
    title: 'Bezbednost',
    picture: 'safety-sector',
    frames: [
      { picture: 'safety-sector', caption: 'Niko u sektoru', verdict: 'bad', info: 'Dok se baca, niko ne stoji u sektoru. Baca se samo na znak, a sprave se skupljaju tek na znak.' },
      { picture: 'safety-carry', caption: 'Kugla se nosi', verdict: 'ok', info: 'Kugla se nikad ne dobacuje drugu ni baca nazad — vraća se nošenjem.' },
      { picture: 'safety-warmup', caption: 'Prvo zagrevanje', verdict: 'ok', info: 'Pre trčanja na vreme obavezno je zagrevanje i nekoliko probnih ubrzanja.' },
      { picture: 'safety-pit', caption: 'Poravnaj pesak', verdict: 'ok', info: 'Posle svakog skoka pesak se poravna, a sledeći skakač kreće tek kada prethodni izađe iz jame.' },
    ],
    question: { text: 'Kako se kugla vraća do bacača?', answer: 'Nosi se — nikad se ne baca.' },
  },
  {
    id: 'fair-play',
    title: 'Fer-plej',
    picture: 'quiet-start',
    frames: [
      { picture: 'quiet-start', caption: 'Tišina na startu', verdict: 'ok', info: 'Posle „Na mesta“ i „Pozor“ ne ometaj druge trkače zvukom ili pokretom. Starter tada prekida start, a ko je ometao može dobiti opomenu.' },
      { picture: 'no-push', caption: 'Ne guraj', verdict: 'bad', info: 'Svako trči svoju trku. Ko gura ili ometa drugog može biti diskvalifikovan.' },
      { picture: 'compare-self', caption: 'Takmiči se sa sobom', verdict: 'ok', info: 'Na času se tvoj rezultat poredi i sa tvojim ranijim rezultatom. Najvažnije je da napreduješ.' },
    ],
    question: { text: 'Sa kim se na času poredi tvoj rezultat?', answer: 'I sa tvojim ranijim rezultatom — važan je napredak.' },
  },
];

export const QUIZ: QuizQuestion[] = [
  { text: 'Koje su komande za niski start?', picture: 'start-set', options: ['„Na mesta“ i „Pozor“', '„Spremi se“ i „Idi“', 'Samo „Start“'], correct: 0, explanation: '„Na mesta“, „Pozor“, pa pucanj.' },
  { text: 'Šta je ovo?', picture: 'false-start', options: ['Pogrešan start', 'Dobar start', 'Visoki start'], correct: 0, explanation: 'Krenuo je pre pucnja — pogrešan start i diskvalifikacija.' },
  { text: 'Koji deo tela odlučuje ko je prvi na cilju?', options: ['Ruka', 'Glava', 'Trup'], correct: 2, explanation: 'Računa se samo trup.' },
  { text: 'Koliko je duga zona za izmenu u štafeti 4 × 100 m?', options: ['10 m', '20 m', '30 m'], correct: 2, explanation: 'Zona za izmenu je duga 30 m.' },
  { text: 'Palica je ispala. Ko je podiže?', picture: 'relay-drop', options: ['Trkač koji ju je ispustio', 'Sledeći trkač', 'Sudija'], correct: 0, explanation: 'Palicu podiže onaj ko ju je ispustio.' },
  { text: 'Šta je ovo?', picture: 'lj-foul', options: ['Prestup — skok se ne meri', 'Dobar skok', 'Skok se ponavlja'], correct: 0, explanation: 'Stopalo je prešlo liniju odraza — neispravan pokušaj.' },
  { text: 'Do kog traga se meri skok udalj?', options: ['Do najdaljeg', 'Do najbližeg', 'Do sredine jame'], correct: 1, explanation: 'Meri se do najbližeg traga u pesku.' },
  { text: 'Posle koliko neuspeha zaredom skakač uvis završava?', options: ['2', '3', '5'], correct: 1, explanation: 'Tri uzastopna neispravna pokušaja i takmičenje je završeno.' },
  { text: 'Kako se baca kugla?', picture: 'shot-push', options: ['Gura se sa ramena jednom rukom', 'Baca se iza glave', 'Baca se obema rukama'], correct: 0, explanation: 'Kugla se gura sa ramena, jednom rukom.' },
  { text: 'Bacaš lopticu desnom rukom. Koja noga je napred?', picture: 'ball-foot', options: ['Desna', 'Leva', 'Svejedno'], correct: 1, explanation: 'Suprotna noga — leva — je napred.' },
];

export const RULE_DOCUMENT_GROUPS: RuleDocumentGroup[] = [
  {
    title: 'Zvanična pravila takmičenja',
    description: 'Atletska takmičenja se održavaju po pravilima Svetske atletike (World Athletics, Book C: Competition Rules i Technical Rules). Srpski atletski savez je objavio prevod izdanja 2024.',
    documents: [
      { title: 'Pravila za atletska takmičenja i tehnička pravila 2024', note: 'prevod Srpskog atletskog saveza', url: 'https://sas.rs/wp-content/uploads/2025/05/Competition-and-Technical-Rules-2024-Edition_SR.docx', language: 'sr', format: 'DOCX' },
      { title: 'World Athletics — Book of Rules', note: 'zvanična stranica sa važećim pravilima (Book C)', url: 'https://worldathletics.org/about-iaaf/documents/book-of-rules', language: 'en', format: 'sajt' },
    ],
  },
  {
    title: 'Takmičenja u Srbiji',
    description: 'Sva takmičenja iz programa Srpskog atletskog saveza odvijaju se po pravilima Svetske atletike i propozicijama SAS.',
    documents: [
      { title: 'Propozicije takmičenja SAS 2026–2028', note: 'Srpski atletski savez', url: 'https://sas.rs/wp-content/uploads/2026/01/PROPOZICIJE-TAKMICENJA-SAS-2026-2028-1.pdf', language: 'sr', format: 'PDF' },
      { title: 'Srpski atletski savez', note: 'vesti, takmičenja, dokumenti', url: 'https://sas.rs/', language: 'sr', format: 'sajt' },
    ],
  },
  {
    title: 'Školski program',
    description: 'Atletika u programu nastave i učenja Fizičkog i zdravstvenog vaspitanja (tekst programa, kopija na sajtu FSFV Niš).',
    documents: [
      { title: 'Program FZV za peti razred', note: 'Prosvetni glasnik, sa uputstvom za ostvarivanje programa', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/V_razred.pdf', language: 'sr', format: 'PDF' },
      { title: 'Program FZV za sedmi razred', note: 'Prosvetni glasnik, sa uputstvom za ostvarivanje programa', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/VII_razred.pdf', language: 'sr', format: 'PDF' },
    ],
  },
];

export const RULE_SOURCE_URL = 'https://worldathletics.org/about-iaaf/documents/book-of-rules';
