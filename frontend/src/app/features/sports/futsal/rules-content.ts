export type FutsalPicture =
  | 'court-full'
  | 'penalty-area'
  | 'goal-size'
  | 'ball-size'
  | 'goal-on-line'
  | 'ball-on-line'
  | 'team-five'
  | 'team-bench'
  | 'flying-sub'
  | 'kick-in'
  | 'corner'
  | 'goal-clearance'
  | 'kick-off'
  | 'four-sec'
  | 'keeper-four-sec'
  | 'back-pass'
  | 'keeper-hands'
  | 'foul-push'
  | 'foul-trip'
  | 'handball'
  | 'tackle-ok'
  | 'fouls-board'
  | 'dfksaf'
  | 'penalty'
  | 'card-yellow'
  | 'card-red'
  | 'two-minutes'
  | 'halves'
  | 'timeout'
  | 'no-offside'
  | 'mini-ball'
  | 'mini-court'
  | 'sig-direct'
  | 'sig-indirect'
  | 'sig-advantage'
  | 'sig-four'
  | 'sig-penalty'
  | 'sig-timeout'
  | 'handshake'
  | 'help-up'
  | 'respect-ref'
  | 'cheer';

export type RuleVerdict = 'ok' | 'bad' | null;

export type RuleFocus = [number, number, number];

export interface RuleFrame {
  picture?: FutsalPicture;
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
  picture?: FutsalPicture;
  image?: string;
  frames: RuleFrame[];
  question: { text: string; answer: string };
}

export interface QuizQuestion {
  text: string;
  picture?: FutsalPicture;
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
    id: 'court',
    title: 'Teren, gol i lopta',
    picture: 'court-full',
    frames: [
      { picture: 'court-full', caption: 'Teren u dvorani', verdict: null, info: 'Futsal se igra u dvorani. Na međunarodnim utakmicama teren je dug 38–42 m i širok 20–25 m; za ostale utakmice dozvoljen je i manji, od 25 × 16 m. Bočne linije su uvek duže od gol-linija.' },
      { picture: 'penalty-area', caption: 'Kazneni prostor 6 m', verdict: null, info: 'Kazneni prostor se pruža 6 m od gola. U njemu je penal-tačka na 6 m, a ispred prostora tačka na 10 m — sa nje se izvodi slobodan udarac od šestog kumulativnog faula.' },
      { picture: 'goal-size', caption: 'Gol 3 × 2 m', verdict: null, info: 'Gol je širok 3 m i visok 2 m — isti kao u rukometu.' },
      { picture: 'ball-size', caption: 'Lopta broj 4', verdict: null, info: 'Futsal lopta je manja od fudbalske (obim 62–64 cm, 400–440 g) i slabije odskače, pa ostaje na podu i lakše se kontroliše.' },
      { picture: 'ball-on-line', caption: 'Cela lopta preko linije', verdict: null, info: 'Lopta je u autu tek kad cela pređe liniju — na podu ili u vazduhu. Gol je postignut kad cela lopta pređe gol-liniju između stativa i ispod prečke.' },
    ],
    question: { text: 'Lopta je na liniji, ali nije cela prešla. Aut ili u igri?', answer: 'U igri — cela lopta mora da pređe liniju.' },
  },
  {
    id: 'team',
    title: 'Ekipa i izmene',
    picture: 'team-five',
    frames: [
      { picture: 'team-five', caption: '4 + golman', verdict: null, info: 'Svaka ekipa ima najviše 5 igrača na terenu, od kojih je jedan golman. Utakmica ne može da počne ako ekipa nema bar 3 igrača.' },
      { picture: 'team-bench', caption: 'Do 9 rezervi', verdict: null, info: 'Na zvaničnim takmičenjima ekipa može da ima do 9 rezervnih igrača.' },
      { picture: 'flying-sub', caption: 'Izmene u letu', verdict: 'ok', info: 'Broj izmena nije ograničen i rade se i dok je lopta u igri, bez prijave sudiji. Igrač koji izlazi napušta teren kroz zonu za izmene svoje ekipe, a novi ulazi kroz istu zonu tek kad je prvi izašao.' },
    ],
    question: { text: 'Koliko puta ekipa sme da menja igrače?', answer: 'Koliko hoće — izmene u letu su neograničene.' },
  },
  {
    id: 'restarts',
    title: 'Aut, korner i izbacaj',
    picture: 'kick-in',
    frames: [
      { picture: 'kick-in', caption: 'Aut se izvodi nogom', verdict: null, info: 'Kad lopta pređe bočnu liniju (ili udari u plafon), protivnik izvodi aut — nogom! Lopta miruje na bočnoj liniji, a protivnici su bar 5 m dalje. Iz auta se ne može direktno dati gol.' },
      { picture: 'corner', caption: 'Korner', verdict: null, info: 'Kad lopta pređe gol-liniju pored gola, a poslednji ju je dotakao branilac, napad izvodi korner iz ugla terena. Protivnici su bar 5 m od lopte.' },
      { picture: 'goal-clearance', caption: 'Golman izbacuje rukom', verdict: null, info: 'Kad lopta pređe gol-liniju pored gola, a poslednji ju je dotakao napadač, golman izbacuje loptu rukom iz svog kaznenog prostora. Protivnici čekaju van prostora.' },
      { picture: 'kick-off', caption: 'Početni udarac', verdict: null, info: 'Utakmica počinje, a posle gola se nastavlja, početnim udarcem sa centra. Svi igrači su na svojoj polovini, a protivnici bar 3 m od lopte. Sa centra se može direktno dati gol.' },
    ],
    question: { text: 'Kako se izvodi aut u futsalu?', answer: 'Nogom, sa lopte koja miruje na bočnoj liniji.' },
  },
  {
    id: 'four-seconds',
    title: 'Četiri sekunde',
    picture: 'four-sec',
    frames: [
      { picture: 'four-sec', caption: '4 s za izvođenje', verdict: 'bad', info: 'Aut, korner, slobodan udarac i izbacaj golmana moraju da se izvedu za 4 sekunde, kad je ekipa spremna. Sudija broji podignutom rukom. Ako ekipa zakasni, protivnik dobija loptu.' },
      { picture: 'keeper-four-sec', caption: 'Golman — 4 s na svojoj polovini', verdict: 'bad', info: 'Golman ne sme da drži loptu (rukama ili nogama) na svojoj polovini duže od 4 sekunde. Za kašnjenje protivnik dobija indirektan slobodan udarac.' },
    ],
    question: { text: 'Koliko sekundi ekipa ima da izvede aut?', answer: '4 sekunde.' },
  },
  {
    id: 'keeper',
    title: 'Golman',
    picture: 'keeper-hands',
    frames: [
      { picture: 'keeper-hands', caption: 'Rukama u svom prostoru', verdict: 'ok', info: 'Golman sme da hvata loptu rukama samo u svom kaznenom prostoru. Van njega igra kao i ostali igrači i sme da izađe i napada.' },
      { picture: 'back-pass', caption: 'Pas nazad — ne rukama', verdict: 'bad', info: 'Ako saigrač namerno doda loptu golmanu nogom (i iz auta), golman ne sme da je uhvati rukama u svom prostoru. Ako uhvati — indirektan slobodan udarac za protivnika.' },
    ],
    question: { text: 'Saigrač namerno doda loptu golmanu nogom. Sme li golman da je uhvati?', answer: 'Ne — sme samo nogom da je igra.' },
  },
  {
    id: 'fouls',
    title: 'Faul i dozvoljen start',
    picture: 'foul-push',
    frames: [
      { picture: 'tackle-ok', caption: 'Start na loptu', verdict: 'ok', info: 'Dozvoljeno je oduzeti loptu protivniku nogom, ako se igra lopta, a ne igrač, i ako start nije nepažljiv ni grub.' },
      { picture: 'foul-push', caption: 'Guranje', verdict: 'bad', info: 'Guranje, saplitanje, udaranje, držanje, skakanje na protivnika i nepažljiv start su faulovi. Protivnik dobija direktan slobodan udarac, a u kaznenom prostoru — penal.' },
      { picture: 'foul-trip', caption: 'Saplitanje', verdict: 'bad', info: 'Ko sapliće protivnika nogom ili telom, pravi faul. Svaki takav faul se broji ekipi kao kumulativni faul.' },
      { picture: 'handball', caption: 'Igranje rukom', verdict: 'bad', info: 'Igrači u polju ne smeju namerno da igraju loptu rukom. Ni golman ne sme rukama van svog kaznenog prostora.' },
    ],
    question: { text: 'Branilac sapliće napadača u svom kaznenom prostoru. Šta sledi?', answer: 'Penal.' },
  },
  {
    id: 'accumulated',
    title: 'Kumulativni faulovi',
    picture: 'fouls-board',
    frames: [
      { picture: 'fouls-board', caption: '5 faulova u poluvremenu', verdict: null, info: 'Zapisničar broji faulove svake ekipe u poluvremenu (oni za koje se dosuđuje direktan slobodan udarac ili penal). Posle poluvremena brojanje kreće od nule.' },
      { picture: 'dfksaf', caption: 'Od 6. — bez živog zida', verdict: 'bad', info: 'Od šestog faula protivnik izvodi direktan slobodan udarac bez živog zida — sa tačke na 10 m, ili sa mesta faula ako je bio bliže golu. Ispred lopte je samo golman.' },
    ],
    question: { text: 'Ekipa je napravila 5 faulova u poluvremenu. Šta donosi šesti?', answer: 'Slobodan udarac bez živog zida.' },
  },
  {
    id: 'penalty',
    title: 'Penal',
    picture: 'penalty',
    frames: [
      { picture: 'penalty', caption: 'Sa 6 m', verdict: null, info: 'Penal se izvodi sa penal-tačke na 6 m. Golman stoji na gol-liniji između stativa, a ostali igrači su van kaznenog prostora, iza tačke i bar 5 m od nje.' },
    ],
    question: { text: 'Sa koliko metara se izvodi penal?', answer: 'Sa 6 m.' },
  },
  {
    id: 'cards',
    title: 'Kartoni i isključenje',
    picture: 'card-red',
    frames: [
      { picture: 'card-yellow', caption: 'Žuti — opomena', verdict: null, info: 'Žuti karton je opomena za nesportsko ponašanje. Dva žuta kartona na istoj utakmici znače crveni.' },
      { picture: 'card-red', caption: 'Crveni — isključenje', verdict: 'bad', info: 'Igrač sa crvenim kartonom napušta teren i klupu do kraja utakmice.' },
      { picture: 'two-minutes', caption: '2 minuta sa igračem manje', verdict: 'bad', info: 'Posle isključenja ekipa igra sa igračem manje. Novi igrač sme da uđe posle 2 minuta igre, ili ranije ako protivnik sa više igrača da gol.' },
    ],
    question: { text: 'Kada isključena ekipa sme da dopuni sastav?', answer: 'Posle 2 minuta, ili kad protivnik da gol.' },
  },
  {
    id: 'time',
    title: 'Trajanje i tajm-aut',
    picture: 'halves',
    frames: [
      { picture: 'halves', caption: '2 × 20 minuta igre', verdict: null, info: 'Utakmica ima 2 poluvremena po 20 minuta čiste igre — sat se zaustavlja kad lopta nije u igri. Pauza između poluvremena najviše 15 minuta.' },
      { picture: 'timeout', caption: '1 tajm-aut po poluvremenu', verdict: null, info: 'Svaka ekipa ima pravo na tajm-aut od 1 minuta u svakom poluvremenu. U produžecima tajm-auta nema.' },
    ],
    question: { text: 'Koliko traje poluvreme u futsalu?', answer: '20 minuta čiste igre.' },
  },
  {
    id: 'offside',
    title: 'Nema ofsajda',
    picture: 'no-offside',
    frames: [
      { picture: 'no-offside', caption: 'Bez ofsajda', verdict: 'ok', info: 'U futsalu ofsajd ne postoji — napadač sme da stoji bilo gde, i iza poslednjeg branioca.' },
    ],
    question: { text: 'Postoji li ofsajd u futsalu?', answer: 'Ne postoji.' },
  },
  {
    id: 'mini',
    title: 'Mali fudbal na času',
    picture: 'mini-court',
    frames: [
      { picture: 'mini-court', caption: 'Manji teren', verdict: 'ok', info: 'U školi se igra na rukometnom terenu i na rukometne golove — mere se uklapaju u pravila futsala. Takmičenja mlađih kategorija mogu da prilagode trajanje i pravila uzrastu.' },
      { picture: 'mini-ball', caption: 'Lopta za futsal', verdict: 'ok', info: 'Lopta za futsal slabije odskače od fudbalske, pa deca lakše vode i dodaju po podu dvorane. Za najmlađe se koristi još manja i lakša lopta.' },
      { picture: 'cheer', caption: 'Svi igraju', verdict: 'ok', info: 'Neograničene izmene u letu omogućavaju da svi igraju — menjajte se često.' },
    ],
    question: { text: 'Zašto futsal lopta slabije odskače?', answer: 'Da ostane na podu i da se lakše kontroliše.' },
  },
  {
    id: 'signals',
    title: 'Znakovi sudija',
    picture: 'sig-direct',
    frames: [
      { picture: 'sig-direct', caption: 'Direktan udarac', verdict: null, info: 'Ruka ispružena vodoravno pokazuje smer napada ekipe koja izvodi direktan slobodan udarac.' },
      { picture: 'sig-indirect', caption: 'Indirektan udarac', verdict: null, info: 'Ruka podignuta uvis i drži se gore dok loptu ne dotakne drugi igrač. Iz indirektnog udarca gol važi tek ako je loptu dotakao još neko.' },
      { picture: 'sig-advantage', caption: 'Prednost', verdict: null, info: 'Obe ruke ispružene napred — faul je bio, ali igra teče jer je ekipa nad kojom je napravljen u prednosti.' },
      { picture: 'sig-four', caption: 'Brojanje 4 sekunde', verdict: null, info: 'Sudija podigne ruku i prstima vidljivo broji četiri sekunde.' },
      { picture: 'sig-penalty', caption: 'Penal', verdict: null, info: 'Sudija pokazuje rukom ka penal-tački.' },
      { picture: 'sig-timeout', caption: 'Tajm-aut', verdict: null, info: 'Šake u obliku slova T — tajm-aut od 1 minuta.' },
    ],
    question: { text: 'Sudija drži podignutu ruku. Kakav je udarac?', answer: 'Indirektan slobodan udarac.' },
  },
  {
    id: 'fair-play',
    title: 'Fer-plej',
    picture: 'handshake',
    frames: [
      { picture: 'handshake', caption: 'Pozdravi protivnika', verdict: 'ok', info: 'Pozdravi protivnika i sudije pre i posle utakmice.' },
      { picture: 'help-up', caption: 'Pomozi da ustane', verdict: 'ok', info: 'Kad protivnik padne, pomozi mu da ustane. Ako se neko povredi, izbaci loptu u aut da bi mu se pomoglo.' },
      { picture: 'respect-ref', caption: 'Kapiten priča mirno', verdict: 'ok', info: 'Odluke sudije se ne raspravljaju. Sa sudijom mirno razgovara kapiten.' },
      { picture: 'cheer', caption: 'Bodri, ne vređaj', verdict: 'ok', info: 'Igrači, roditelji i navijači: bodrite sve — deca uče od vas.' },
    ],
    question: { text: 'Protivnik je povređen, a lopta je kod tebe. Šta radiš?', answer: 'Izbaciš loptu u aut da mu se pomogne.' },
  },
];

export const QUIZ: QuizQuestion[] = [
  { text: 'Koliko igrača jedne ekipe je na terenu?', options: ['5 (4 + golman)', '6', '7'], correct: 0, explanation: 'Najviše 5 igrača, od toga jedan golman.' },
  { text: 'Kako se izvodi aut?', picture: 'kick-in', options: ['Rukama', 'Nogom', 'Golman izbacuje'], correct: 1, explanation: 'U futsalu se aut izvodi nogom, sa bočne linije.' },
  { text: 'Koliko sekundi ima ekipa da izvede aut ili korner?', options: ['3', '4', '6'], correct: 1, explanation: '4 sekunde — inače lopta ide protivniku.' },
  { text: 'Koliko traje poluvreme?', options: ['20 minuta čiste igre', '25 minuta', '45 minuta'], correct: 0, explanation: '2 × 20 minuta, sat staje kad lopta nije u igri.' },
  { text: 'Od kog faula ekipe u poluvremenu se izvodi udarac bez živog zida?', options: ['Od 4.', 'Od 6.', 'Od 10.'], correct: 1, explanation: 'Od šestog kumulativnog faula.' },
  { text: 'Sa koliko metara se izvodi penal?', picture: 'penalty', options: ['6 m', '9 m', '11 m'], correct: 0, explanation: 'Penal-tačka je na 6 m.' },
  { text: 'Postoji li ofsajd?', options: ['Da', 'Ne', 'Samo u drugom poluvremenu'], correct: 1, explanation: 'U futsalu nema ofsajda.' },
  { text: 'Šta je ovo?', picture: 'back-pass', options: ['Dozvoljeno', 'Prekršaj golmana', 'Korner'], correct: 1, explanation: 'Golman ne sme rukama da uhvati loptu koju mu je saigrač namerno dodao nogom.' },
  { text: 'Šta pokazuje sudija?', picture: 'sig-indirect', options: ['Indirektan udarac', 'Penal', 'Gol'], correct: 0, explanation: 'Podignuta ruka — indirektan slobodan udarac.' },
  { text: 'Isključen igrač — kada ekipa dopunjuje sastav?', options: ['Odmah', 'Posle 2 minuta ili gola protivnika', 'Nikad'], correct: 1, explanation: 'Posle 2 minuta igre, ili ranije ako protivnik da gol.' },
];

export const RULE_DOCUMENT_GROUPS: RuleDocumentGroup[] = [
  {
    title: 'Zvanična pravila igre',
    description: 'Važe FIFA Pravila futsal igre, izdanje 2025/26. FIFA ih objavljuje na engleskom, francuskom, španskom i arapskom; zvaničan prevod Fudbalskog saveza Srbije na naš jezik nismo našli objavljen.',
    documents: [
      { title: 'FIFA Futsal Laws of the Game 2025/26', note: 'ceo tekst pravila', url: 'https://the-aiff.com/media/uploads/2025/09/Futsal-Laws-of-the-Game-2025-2026_EN.pdf', language: 'en', format: 'PDF' },
      { title: 'Izmene pravila 2025/26', note: 'pregled izmena sa označenim tekstom', url: 'https://the-aiff.com/media/uploads/2025/09/Futsal-Laws-of-the-Game-2025-2026-Summary-of-changes_EN.pdf', language: 'en', format: 'PDF' },    ],
  },
  {
    title: 'Futsal u Srbiji',
    description: 'Takmičenja u futsalu vodi Fudbalski savez Srbije.',
    documents: [{ title: 'Fudbalski savez Srbije', note: 'takmičenja, propisi, vesti', url: 'https://fss.rs/', language: 'sr', format: 'sajt' }],
  },
];

export const RULE_SOURCE_URL = 'https://the-aiff.com/media/uploads/2025/09/Futsal-Laws-of-the-Game-2025-2026_EN.pdf';
