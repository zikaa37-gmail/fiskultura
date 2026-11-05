export type GymnasticsPicture =
  | 'mats-joined'
  | 'mats-gap'
  | 'warmup'
  | 'one-on-apparatus'
  | 'roll-rock'
  | 'roll-start'
  | 'roll-tuck'
  | 'roll-head'
  | 'roll-help'
  | 'back-start'
  | 'back-roll'
  | 'back-help'
  | 'back-kneel'
  | 'candle-tuck'
  | 'candle'
  | 'candle-bad'
  | 'candle-help'
  | 'bridge-start'
  | 'bridge'
  | 'bridge-bad'
  | 'bridge-help'
  | 'hs-wall'
  | 'hs-help'
  | 'handstand'
  | 'handstand-bad'
  | 'cw-weight'
  | 'cartwheel'
  | 'cartwheel-bad'
  | 'cw-help'
  | 'board-takeoff'
  | 'board-one-foot'
  | 'vault-tuck'
  | 'vault-hook'
  | 'vault-help'
  | 'vault-straddle'
  | 'straddle-help'
  | 'landing'
  | 'landing-bad'
  | 'beam-order'
  | 'beam-walk'
  | 'beam-look-down'
  | 'beam-dismount'
  | 'bar-grip-ok'
  | 'bar-grip-bad'
  | 'bar-support'
  | 'hang-knees'
  | 'pb-support'
  | 'pb-support-bad'
  | 'pb-swing'
  | 'pb-swing-bad'
  | 'pb-help'
  | 'rings-height'
  | 'rings-tuck'
  | 'rings-inverted'
  | 'rings-bad'
  | 'judge-start'
  | 'judge-flow'
  | 'judge-two';

export type GymnasticsPoseName =
  | 'stand'
  | 'stand-up'
  | 'squat'
  | 'rock'
  | 'roll-tuck'
  | 'roll-head'
  | 'squat-hands-up'
  | 'back-roll'
  | 'kneel'
  | 'lie-back'
  | 'candle-tuck'
  | 'candle'
  | 'candle-bad'
  | 'bridge'
  | 'bridge-bad'
  | 'handstand'
  | 'handstand-bad'
  | 'plank'
  | 'cartwheel'
  | 'cartwheel-bad'
  | 'one-foot'
  | 'landing'
  | 'landing-bad'
  | 'vault-tuck'
  | 'vault-straddle'
  | 'vault-hook'
  | 'hang-knees'
  | 'support'
  | 'support-bad'
  | 'swing'
  | 'swing-bad'
  | 'rings-inverted'
  | 'rings-tuck'
  | 'rings-bad'
  | 'beam-walk'
  | 'beam-look-down'
  | 'tuck-jump'
  | 'kneel-spot'
  | 'spot-forward'
  | 'spot-up'
  | 'spot-low';

export type GymnasticsPoseRole = 'us' | 'help';

export interface GymnasticsPose {
  head: number[];
  torso: string;
  legs: string;
  arms: string;
}

export type RuleVerdict = 'ok' | 'bad' | null;

export type RuleFocus = [number, number, number];

export interface RuleFrame {
  picture?: GymnasticsPicture;
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
  picture?: GymnasticsPicture;
  image?: string;
  frames: RuleFrame[];
  question: { text: string; answer: string };
}

export interface QuizQuestion {
  text: string;
  picture?: GymnasticsPicture;
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
  format: 'PDF' | 'sajt';
}

export interface RuleDocumentGroup {
  title: string;
  description: string;
  documents: RuleDocument[];
}

export const RULE_CARDS: RuleCard[] = [
  {
    id: 'safety',
    title: 'Sigurno vežbanje',
    picture: 'mats-joined',
    frames: [
      { picture: 'mats-joined', caption: 'Strunjače spojene', verdict: 'ok', info: 'Strunjače se slažu jedna uz drugu, bez razmaka. Kolutovi se nikad ne rade na tvrdoj podlozi.' },
      { picture: 'mats-gap', caption: 'Razmak između strunjača', verdict: 'bad', info: 'Ako između strunjača ima razmaka, prvo ih spojimo — tek onda vežbamo.' },
      { picture: 'warmup', caption: 'Prvo zagrevanje', verdict: 'ok', info: 'Pre gimnastike zagrevamo šake, ramena, vrat, leđa i trbuh. Glavu pomeramo polako, bez kruženja. Dok trčimo, idemo po ivici sale — dalje od sprava.' },
      { picture: 'one-on-apparatus', caption: 'Jedan po jedan', verdict: 'ok', info: 'Na gredi i na razboju je uvek samo jedan učenik. Ostali čekaju sa strane. Radiš samo vežbu koju si već vežbao na času.' },
    ],
    question: { text: 'Šta radimo pre vežbanja na tlu i spravama?', answer: 'Zagrevanje — šake, ramena, vrat i leđa.' },
  },
  {
    id: 'roll-forward',
    title: 'Kolut napred',
    picture: 'roll-tuck',
    frames: [
      { picture: 'roll-rock', caption: 'Povaljka', verdict: null, info: 'Prvi korak: ležiš na leđima zgrčeno, brada na grudima, i ljuljaš se napred-nazad. Desetak puta, pa ustaneš bez ruku.' },
      { picture: 'roll-start', caption: 'Šake ispred stopala', verdict: null, info: 'Iz čučnja staviš šake u širini ramena, 30–40 cm ispred stopala, prsti gledaju napred. Onda se odraziš obema nogama.' },
      { picture: 'roll-tuck', caption: 'Potiljak i lopatice', verdict: 'ok', info: 'Brada je na grudima, a oslanjaš se na potiljak i lopatice. Na kraju ustaneš do stava bez pomoći ruku.' },
      { picture: 'roll-head', caption: 'Oslonac na teme', verdict: 'bad', info: 'Greška: oslonac na teme ili čelo i brada odvojena od grudi. Česte greške su još i laktovi u stranu i završetak u sedu.' },
      { picture: 'roll-help', caption: 'Ruka na potiljku', verdict: null, info: 'Nastavnik kleči sa strane: jednom rukom na potiljku pomaže da glava ide ka grudima, drugom na natkolenici reguliše brzinu.' },
    ],
    question: { text: 'Na šta se oslanjaš u kolutu napred?', answer: 'Na potiljak i lopatice — brada je na grudima.' },
  },
  {
    id: 'roll-back',
    title: 'Kolut nazad',
    picture: 'back-roll',
    frames: [
      { picture: 'back-start', caption: 'Brada na grudi', verdict: null, info: 'Stojiš leđima prema strunjači. Spustiš se u čučanj i nagneš ka petama, šake su iznad ramena, brada na grudima, leđa zaobljena.' },
      { picture: 'back-roll', caption: 'Šake kod ušiju', verdict: 'ok', info: 'Šake staviš ravno na strunjaču, palčevi su kod ušiju. Snažno se odgurneš rukama do čučnja i uspraviš se.' },
      { picture: 'back-help', caption: 'Pomoć za kukove', verdict: null, info: 'Najteži trenutak je kad glava prolazi između ruku. Nastavnik te tada hvata za kukove i podiže ih naviše-unazad. Dok glavu ne prelaziš lako, pomoć je obavezna.' },
      { picture: 'back-kneel', caption: 'Završetak u kleku', verdict: 'bad', info: 'Greške: završetak u kleku, slabo odgurivanje rukama, šake okrenute upolje, ravna leđa i kolutanje u stranu.' },
    ],
    question: { text: 'Gde su palčevi u kolutu nazad?', answer: 'Kod ušiju — pa se snažno odgurneš rukama.' },
  },
  {
    id: 'candle',
    title: 'Sveća',
    picture: 'candle',
    frames: [
      { picture: 'candle-tuck', caption: 'Sveća zgrčeno', verdict: null, info: 'Iz ležanja na leđima podigneš noge, kolena idu ka čelu, a šakama podupreš leđa.' },
      { picture: 'candle', caption: 'Telo opruženo', verdict: 'ok', info: 'Opružiš noge do vertikale. Telo je pravo od ramena do prstiju, oslanjaš se na lopatice i nadlaktice — ne na vrat. Izdrži 3–5 sekundi.' },
      { picture: 'candle-bad', caption: 'Savijen u kukovima', verdict: 'bad', info: 'Greška: savijanje u kukovima — kao da „sediš u vazduhu”. Greške su i laktovi široko, oslonac na vratu i savijene noge.' },
      { picture: 'candle-help', caption: 'Drug pridržava', verdict: null, info: 'Radite u paru: jedan izvodi, drugi stoji sa strane i drži ga za pete i kolena dok ne uhvati ravnotežu. Glava ostaje pravo.' },
    ],
    question: { text: 'Na šta se oslanjaš u sveći?', answer: 'Na lopatice i nadlaktice, ne na vrat.' },
  },
  {
    id: 'bridge',
    title: 'Most',
    picture: 'bridge',
    frames: [
      { picture: 'bridge-start', caption: 'Šake pored ušiju', verdict: null, info: 'Ležiš na leđima zgrčeno, stopala blizu zadnjice. Šake su pored ušiju, prsti gledaju ka ramenima.' },
      { picture: 'bridge', caption: 'Ruke opružene', verdict: 'ok', info: 'Istovremeno opružaš ruke i noge i telo se podigne u luk. Ramena su iznad šaka, pogled ka šakama. Izdrži 2–3 sekunde.' },
      { picture: 'bridge-bad', caption: 'Savijene ruke', verdict: 'bad', info: 'Greške: savijene ruke, ramena daleko iza šaka, kolena razmaknuta i naglo spuštanje na glavu. Spuštaš se polako, brada ka grudima.' },
      { picture: 'bridge-help', caption: 'Pomagač sa strane', verdict: null, info: 'Pomagač stoji sa strane: jednom rukom drži ispod lopatica, drugom za donji deo leđa. Most se radi tek posle zagrevanja leđa i ramena.' },
    ],
    question: { text: 'Kako se spuštaš iz mosta?', answer: 'Polako, sa bradom ka grudima.' },
  },
  {
    id: 'handstand',
    title: 'Stav o šakama',
    picture: 'handstand',
    frames: [
      { picture: 'hs-wall', caption: 'Uz zid ili lestve', verdict: null, info: 'Prvo leđima ka zidu ili švedskim lestvama: šake na tlo, a stopalima se „penješ” uz zid sve do vertikale.' },
      { picture: 'hs-help', caption: 'Pomagač drži nogu', verdict: null, info: 'Radite u trojkama: vežbač, pomagač i posmatrač. Pomagač stoji sa strane zamajne noge i hvata je za natkolenicu.' },
      { picture: 'handstand', caption: 'Sve u jednoj liniji', verdict: 'ok', info: 'Prsti rašireni, ruke opružene, pogled u šake. Šaka, rame, kuk i skočni zglob su u jednoj liniji, trbuh i leđa zategnuti.' },
      { picture: 'handstand-bad', caption: 'Savijeni laktovi', verdict: 'bad', info: 'Greške: savijeni laktovi, preširoko postavljene ruke i opušteno telo. Ako zamahneš prejako: savij ruke, bradu na grudi i izađi kolutom napred.' },
    ],
    question: { text: 'Šta radiš ako u stavu o šakama prejako zamahneš?', answer: 'Savijem ruke, bradu na grudi i izađem kolutom napred.' },
  },
  {
    id: 'cartwheel',
    title: 'Premet strance — zvezda',
    picture: 'cartwheel',
    frames: [
      { picture: 'cw-weight', caption: 'Sa ruke na ruku', verdict: null, info: 'Pripremna vežba: iz upora ležećeg prenosiš težinu sa jedne ruke na drugu.' },
      { picture: 'cartwheel', caption: 'Noge kao slovo V', verdict: 'ok', info: 'Iskorak, pa jedna šaka, pa druga — sve po liniji. Noge prolaze preko tela raznožno, kao slovo V. Spušta se jedna pa druga noga, završiš u raskoraku sa rukama u odručenju.' },
      { picture: 'cartwheel-bad', caption: 'Savijeni kukovi', verdict: 'bad', info: 'Greške: savijeni kukovi i noge, ruke i noge van linije i premet „preko leđa” umesto kroz vertikalu.' },
      { picture: 'cw-help', caption: 'Pomoć iza leđa', verdict: null, info: 'Pomagač stoji iza leđa vežbača, hvata ga za bokove ukrštenim rukama i prenosi ga kroz okret.' },
    ],
    question: { text: 'Kakve su noge u premetu strance?', answer: 'Opružene i raširene — kao slovo V.' },
  },
  {
    id: 'vault-squat',
    title: 'Odskočna daska i zgrčka',
    picture: 'vault-tuck',
    frames: [
      { picture: 'board-takeoff', caption: 'Sunožno, na prste', verdict: 'ok', info: 'Posle zaleta naskočiš na dasku obema nogama, na prste, stopala paralelna, kolena opružena — i odraziš se uvis.' },
      { picture: 'board-one-foot', caption: 'Odraz jednom nogom', verdict: 'bad', info: 'Greške na dasci: odraz jednom nogom, doskok na pete, razmaknuta stopala i predugačak poslednji korak.' },
      { picture: 'vault-tuck', caption: 'Kolena ka grudima', verdict: 'ok', info: 'Šake na spravu u širini ramena, kukovi gore, kolena ka grudima — noge prolaze između ruku. Odbiješ se rukama i doskočiš sunožno.' },
      { picture: 'vault-hook', caption: 'Stopala zakače spravu', verdict: 'bad', info: 'Greške: kukovi nedovoljno podignuti, stopala zakače spravu, kasno odbijanje rukama i doskok na opružene noge.' },
      { picture: 'vault-help', caption: 'Pomagač pored sprave', verdict: null, info: 'Pomagač stoji bokom uz spravu, obema rukama hvata nadlakticu (ispod pazuha) i iskorakom te prenese do doskoka. Bez pomagača se ne skače dok noge ne prolaze sigurno.' },
    ],
    question: { text: 'Kako se odražavaš sa odskočne daske?', answer: 'Sunožno — obema nogama zajedno.' },
  },
  {
    id: 'vault-straddle',
    title: 'Raznoška i doskok',
    picture: 'vault-straddle',
    frames: [
      { picture: 'vault-straddle', caption: 'Noge raznožno', verdict: 'ok', info: 'Zalet, sunožni odraz sa daske, kratko odbijanje šakama od kozlića, noge raznožno — i doskok sunožno.' },
      { picture: 'straddle-help', caption: 'Pomagač ispred', verdict: null, info: 'Pomagač stoji ispred sprave, licem prema zaletu, hvata vežbača za nadlaktice i korakom unazad ga prenese do doskoka. Dok ne preskačeš sigurno, pomagač je obavezan.' },
      { picture: 'landing', caption: 'Mekan doskok', verdict: 'ok', info: 'Doskačeš sunožno i savijaš kolena da ublažiš doskok. Doskočna strunjača mora biti učvršćena.' },
      { picture: 'landing-bad', caption: 'Opružene noge', verdict: 'bad', info: 'Doskok na opružene noge ili na pete, bez amortizacije, česta je greška.' },
    ],
    question: { text: 'Kako izgleda dobar doskok?', answer: 'Sunožno i mekano, sa savijenim kolenima.' },
  },
  {
    id: 'beam',
    title: 'Niska greda',
    picture: 'beam-walk',
    frames: [
      { picture: 'beam-order', caption: 'Linija, klupa, greda', verdict: null, info: 'Svaki element se uči redom: prvo na liniji na podu, pa na švedskoj klupi, pa na niskoj gredi.' },
      { picture: 'beam-walk', caption: 'Pogled napred', verdict: 'ok', info: 'Gimnastičko hodanje: uspravno, pogled napred, ruke u odručenju. Na sredini grede okret u usponu.' },
      { picture: 'beam-look-down', caption: 'Pogled na stopala', verdict: 'bad', info: 'Greške na gredi: pogled na stopala, opuštena ramena i doskok na pete.' },
      { picture: 'beam-dismount', caption: 'Saskok zgrčeno', verdict: 'ok', info: 'Saskok zgrčeno sa mekim doskokom na strunjaču. Strunjače su uz gredu i na mestu saskoka, a na gredi je samo jedan učenik.' },
    ],
    question: { text: 'Kuda gledaš dok hodaš po gredi?', answer: 'Napred, ne u stopala.' },
  },
  {
    id: 'bar',
    title: 'Vratilo i lestve',
    picture: 'bar-support',
    frames: [
      { picture: 'bar-grip-ok', caption: 'Palac obuhvata', verdict: 'ok', info: 'Hvat nathvatom: prsti preko pritke, a palac je obuhvata.' },
      { picture: 'bar-grip-bad', caption: 'Hvat bez palca', verdict: 'bad', info: 'Hvat bez palca je česta greška. Šake neka budu suve; ispod pritke su strunjače.' },
      { picture: 'bar-support', caption: 'Upor prednji', verdict: 'ok', info: 'Dohvatno vratilo je u visini grudi. U uporu prednjem ruke su opružene, telo opruženo, kukovi na pritki. Od 6. razreda učenici rade vratilo, a učenice dvovisinski razboj.' },
      { picture: 'hang-knees', caption: 'Vis — kolena gore', verdict: null, info: 'Na švedskim lestvama ili vratilu: visiš opruženih ruku, privučeš kolena ka grudima i polako ih spustiš — bez njihanja. Silaziš bez skakanja unazad.' },
    ],
    question: { text: 'Gde je palac kad držiš pritku?', answer: 'Obuhvata pritku.' },
  },
  {
    id: 'parallel-bars',
    title: 'Razboj',
    picture: 'pb-support',
    frames: [
      { picture: 'pb-support', caption: 'Ramena spuštena', verdict: 'ok', info: 'Pritke su u visini grudi. U uporu su ruke opružene, ramena spuštena (ne ka ušima), telo opruženo, pogled napred.' },
      { picture: 'pb-support-bad', caption: 'Savijeni laktovi', verdict: 'bad', info: 'Greška: savijeni laktovi i „propadanje” u ramenima.' },
      { picture: 'pb-swing', caption: 'Njih iz ramena', verdict: 'ok', info: 'Njihanje počinje malim zamahom, pa sve većim. Njišeš se iz ramena, a telo se ne savija u kukovima.' },
      { picture: 'pb-swing-bad', caption: 'Njih iz kukova', verdict: 'bad', info: 'Greška: njih savijenim telom — iz kukova, kao klatno. Greške su i saskok bez amortizacije i puštanje pritke pre doskoka.' },
      { picture: 'pb-help', caption: 'Nastavnik uz razboj', verdict: null, info: 'Nastavnik stoji uz razboj i jednom rukom stalno drži nadlakticu, a drugom pomaže njih. Na razboju je samo jedan učenik.' },
    ],
    question: { text: 'Kakve su ruke u uporu na razboju?', answer: 'Opružene, a ramena spuštena.' },
  },
  {
    id: 'rings',
    title: 'Krugovi',
    picture: 'rings-inverted',
    frames: [
      { picture: 'rings-height', caption: 'U visini glave', verdict: 'ok', info: 'Dohvatni krugovi su u visini glave, tako da stopala dosežu tlo. Ispod su strunjače.' },
      { picture: 'rings-tuck', caption: 'Vis uzneto', verdict: null, info: 'Iz visa stojećeg zgibom i podizanjem nogu dođeš u vis uzneto: kolena ka grudima, kukovi ispod šaka.' },
      { picture: 'rings-inverted', caption: 'Vis strmoglavo', verdict: 'ok', info: 'Opružiš noge do visa strmoglavo: telo vertikalno, glava dole. Izdrži 2 sekunde. Dok visiš naopako, krugovi se ne ljuljaju.' },
      { picture: 'rings-bad', caption: 'Savijene ruke', verdict: 'bad', info: 'Greške: savijene ruke u visu strmoglavo, razdvojene noge i puštanje krugova pre nego što su stopala na tlu.' },
    ],
    question: { text: 'Koliko su visoko dohvatni krugovi?', answer: 'U visini glave — stopala dosežu tlo.' },
  },
  {
    id: 'judging',
    title: 'Kako nastavnik ocenjuje',
    picture: 'judge-start',
    frames: [
      { picture: 'judge-start', caption: 'Početni i završni stav', verdict: null, info: 'Kriterijume znaš unapred. Nastavnik gleda pravilan početni i završni stav i tehniku glavnih delova vežbe.' },
      { picture: 'judge-flow', caption: 'Bez zastoja', verdict: null, info: 'U sastavu se gleda povezanost: elementi idu jedan za drugim, bez zastoja.' },
      { picture: 'landing', caption: 'Siguran doskok', verdict: 'ok', info: 'Gleda se siguran doskok i da li vežbu izvodiš sam ili uz pomoć.' },
      { picture: 'judge-two', caption: 'Bolji pokušaj', verdict: null, info: 'Imaš dva pokušaja, a računa se bolji. Možeš da izabereš osnovni ili teži zadatak, prema svojim mogućnostima.' },
    ],
    question: { text: 'Koliko pokušaja imaš na proveri?', answer: 'Dva — računa se bolji.' },
  },
];

export const QUIZ: QuizQuestion[] = [
  { text: 'Šta nije dobro na slici?', picture: 'roll-head', options: ['Oslonac na teme', 'Ruke na strunjači', 'Strunjača'], correct: 0, explanation: 'U kolutu napred brada je na grudima, a oslonac je na potiljku i lopaticama.' },
  { text: 'Strunjače su razmaknute. Šta radimo?', picture: 'mats-gap', options: ['Vežbamo odmah', 'Spojimo ih bez razmaka', 'Preskačemo razmak'], correct: 1, explanation: 'Strunjače se spajaju bez razmaka, pa tek onda vežbamo.' },
  { text: 'Gde su palčevi u kolutu nazad?', options: ['Kod ušiju', 'Na kolenima', 'Iza leđa'], correct: 0, explanation: 'Šake su ravno na tlu, palčevi kod ušiju, pa snažno odgurivanje.' },
  { text: 'Šta nije dobro u ovoj sveći?', picture: 'candle-bad', options: ['Savijen u kukovima', 'Šake na leđima', 'Ništa, sve je dobro'], correct: 0, explanation: 'U sveći je telo opruženo od ramena do prstiju stopala.' },
  { text: 'Kako se odražavaš sa odskočne daske?', options: ['Jednom nogom', 'Sunožno', 'Iz čučnja'], correct: 1, explanation: 'Sa daske se odražava sunožno — obema nogama, na prstima.' },
  { text: 'Šta je pošlo naopako?', picture: 'vault-hook', options: ['Stopala su zakačila spravu', 'Ništa, dobar preskok', 'Doskok na strunjaču'], correct: 0, explanation: 'Kukovi moraju gore i kolena ka grudima, da noge prođu između ruku.' },
  { text: 'Kuda gledaš na gredi?', picture: 'beam-look-down', options: ['U stopala', 'Napred', 'U plafon'], correct: 1, explanation: 'Gimnastičko hodanje: uspravno, pogled napred.' },
  { text: 'Koliko učenika je istovremeno na gredi ili razboju?', options: ['Jedan', 'Dva', 'Koliko stane'], correct: 0, explanation: 'Na spravi je samo jedan učenik, ostali čekaju sa strane.' },
  { text: 'Kako izgleda dobar doskok?', options: ['Na opružene noge', 'Mekano, sa savijenim kolenima', 'Na pete'], correct: 1, explanation: 'Doskok je sunožan i mekan — kolena se savijaju.' },
  { text: 'Ko pomaže u stavu o šakama?', picture: 'hs-help', options: ['Niko', 'Pomagač sa strane, drži natkolenicu', 'Pomagač ispod vežbača'], correct: 1, explanation: 'Pomagač stoji sa strane zamajne noge i hvata natkolenicu.' },
];

export const RULE_DOCUMENT_GROUPS: RuleDocumentGroup[] = [
  {
    title: 'Školski program',
    description: 'Programi nastave i učenja Fizičkog i zdravstvenog vaspitanja (Prosvetni glasnik) sa uputstvom za ostvarivanje programa — sadržaji sportske gimnastike po razredima.',
    documents: [
      { title: 'Program za 5. razred osnovne škole', note: 'Prosvetni glasnik, kopija FSFV Niš', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/V_razred.pdf', language: 'sr', format: 'PDF' },
      { title: 'Program za 6. razred osnovne škole', note: 'Prosvetni glasnik, kopija FSFV Niš', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/VI_razred.pdf', language: 'sr', format: 'PDF' },
      { title: 'Program za 7. razred osnovne škole', note: 'Prosvetni glasnik, kopija FSFV Niš', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/VII_razred.pdf', language: 'sr', format: 'PDF' },
      { title: 'Pravilnik o planu i programu za gimnaziju', note: 'Prosvetni glasnik 4/2020, ZUOV', url: 'https://zuov.gov.rs/wp-content/uploads/2020/08/pravilnik-gimnazija.pdf', language: 'sr', format: 'PDF' },
    ],
  },
  {
    title: 'Metodika za nastavnike',
    description: 'Literatura Fakulteta sporta i fizičkog vaspitanja u Nišu: metodski nizovi, pomaganje i čuvanje, najčešće greške.',
    documents: [
      { title: 'Sportska gimnastika II — Metodika sportske gimnastike', note: 'Veličković, Petković, Ilić, 2013', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/treca_godina/gimnastika/skolsk/SPORTSKA_GIMNASTIKA_II.pdf', language: 'sr', format: 'PDF' },
      { title: 'Metodski postupci obučavanja vežbi na tlu', note: 'predavanje, Metodika fizičkog vaspitanja', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/METODSKI-POSTUPCI-OBUCAVANJA-VEZBI-NA-TLU.pdf', language: 'sr', format: 'PDF' },
      { title: 'Preskoci', note: 'predavanje iz Sportske gimnastike', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/treca_godina/gimnastika/20_21_skolska/09-12-PRESKOCI.pdf', language: 'sr', format: 'PDF' },
    ],
  },
  {
    title: 'Savezi i takmičarska pravila',
    description: 'Gimnastički savez Srbije i Svetska gimnastika (FIG) — pravilnici za takmičenja i Code of Points 2025–2028.',
    documents: [
      { title: 'Gimnastički savez Srbije', note: 'vesti, takmičenja, propozicije', url: 'https://www.gssrb.rs/', language: 'sr', format: 'sajt' },
      { title: 'ŽSG 2026 — propozicije i sistem takmičenja', note: 'GSS, ženska sportska gimnastika', url: 'https://www.gssrb.rs/wp-content/uploads/2026/04/ZSG-2026-PROPOZICIJE-i-SISTEM-TAKMICENJA-Izmenjeno-i-dopunjeno-izdanje-1.pdf', language: 'sr', format: 'PDF' },
      { title: 'World Gymnastics (FIG) — Rules', note: 'Code of Points 2025–2028 za sve discipline', url: 'https://www.gymnastics.sport/site/rules/', language: 'en', format: 'sajt' },
    ],
  },
];

export const RULE_SOURCE_URL = 'https://www.fsfv.ni.ac.rs/files/documents/oas/treca_godina/gimnastika/skolsk/SPORTSKA_GIMNASTIKA_II.pdf';
