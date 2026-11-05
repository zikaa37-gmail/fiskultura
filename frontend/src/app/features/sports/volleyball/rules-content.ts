export type VolleyballPicture =
  | 'court-full'
  | 'court-zones'
  | 'net-height'
  | 'antenna'
  | 'ball-in'
  | 'ball-on-line'
  | 'ball-out'
  | 'team-six'
  | 'libero'
  | 'team-sub'
  | 'scoreboard'
  | 'fifth-set'
  | 'rally-point'
  | 'serve-zone'
  | 'serve-foot-line'
  | 'serve-net'
  | 'serve-block'
  | 'rotation'
  | 'side-out'
  | 'receive-order'
  | 'three-touches'
  | 'four-touches'
  | 'block-touch'
  | 'set-fingers'
  | 'dig-forearms'
  | 'double-contact'
  | 'catch'
  | 'foot-touch'
  | 'net-touch'
  | 'center-line-ok'
  | 'center-line-bad'
  | 'block-over'
  | 'back-row-attack'
  | 'match-sets'
  | 'timeout'
  | 'card-yellow'
  | 'card-red'
  | 'card-expulsion'
  | 'card-disqualification'
  | 'mini-court'
  | 'mini-ball'
  | 'mini-teams'
  | 'sig-in'
  | 'sig-out'
  | 'sig-four'
  | 'sig-double'
  | 'sig-catch'
  | 'sig-net'
  | 'sig-timeout'
  | 'sig-sub'
  | 'handshake-net'
  | 'high-five'
  | 'respect-ref'
  | 'cheer';

export type RuleVerdict = 'ok' | 'bad' | null;

export type RuleFocus = [number, number, number];

export interface RuleFrame {
  picture?: VolleyballPicture;
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
  picture?: VolleyballPicture;
  image?: string;
  frames: RuleFrame[];
  question: { text: string; answer: string };
}

export interface QuizQuestion {
  text: string;
  picture?: VolleyballPicture;
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
    title: 'Teren i mreža',
    picture: 'court-full',
    frames: [
      { picture: 'court-full', caption: '18 × 9 m', verdict: null, info: 'Teren je dugačak 18 m i širok 9 m. Mreža ga deli na dve polovine od 9 × 9 m — svaka ekipa ima svoju.' },
      { picture: 'court-zones', caption: 'Linija napada', verdict: null, info: 'Linija napada je 3 m od mreže. Ispred nje je prednja zona, iza nje zadnja zona. Oko terena je slobodna zona — i tu se lopta sme igrati.' },
      { picture: 'net-height', caption: '2,43 m i 2,24 m', verdict: null, info: 'Mreža je visoka 2,43 m za muškarce i 2,24 m za žene. Za decu i mlađe kategorije mreža je niža.' },
      { picture: 'antenna', caption: 'Između antena', verdict: 'ok', info: 'Na krajevima mreže su antene. Lopta mora da pređe na drugu stranu iznad mreže i između antena. Lopta koja dotakne antenu je u autu.' },
    ],
    question: { text: 'Lopta pređe mrežu spolja, pored antene. Važi li?', answer: 'Ne — mora da pređe između antena.' },
  },
  {
    id: 'in-out',
    title: 'Unutra ili aut',
    picture: 'ball-on-line',
    frames: [
      { picture: 'ball-in', caption: 'U terenu', verdict: 'ok', info: 'Lopta koja padne u teren protivnika donosi poen ekipi koja ju je poslala.' },
      { picture: 'ball-on-line', caption: 'Na liniji = unutra', verdict: 'ok', info: 'U odbojci linije pripadaju terenu! Lopta koja dotakne liniju je „unutra" — isto kao da je pala u teren.' },
      { picture: 'ball-out', caption: 'Van linije', verdict: 'bad', info: 'Lopta koja padne potpuno van linija je u autu. Poen dobija ekipa koja je nije poslednja dotakla.' },
    ],
    question: { text: 'Lopta dotakne liniju. Aut ili unutra?', answer: 'Unutra — linija je deo terena.' },
  },
  {
    id: 'team',
    title: 'Ekipa, libero i izmene',
    picture: 'team-six',
    frames: [
      { picture: 'team-six', caption: '6 protiv 6', verdict: null, info: 'Na terenu je po 6 igrača svake ekipe: trojica u prednjoj liniji (uz mrežu) i trojica u zadnjoj.' },
      { picture: 'libero', caption: 'Libero — drugi dres', verdict: null, info: 'Libero je igrač odbrane u dresu druge boje. Igra samo u zadnjoj liniji, ne servira, ne blokira i ne sme da napada loptu koja je iznad visine mreže. Ulazi i izlazi koliko god puta — to se ne broji kao izmena.' },
      { picture: 'team-sub', caption: '6 izmena u setu', verdict: null, info: 'Ekipa ima najviše 6 izmena u jednom setu. Igrač koji ulazi čeka u zoni za izmene, a sudija je odobrava kad je lopta van igre.' },
    ],
    question: { text: 'Koliko izmena ekipa ima u jednom setu?', answer: '6 (libero se ne računa).' },
  },
  {
    id: 'points',
    title: 'Poeni i setovi',
    picture: 'scoreboard',
    frames: [
      { picture: 'rally-point', caption: 'Svaka lopta je poen', verdict: null, info: 'Poen se dobija u svakoj akciji, bez obzira ko je servirao. Ekipa koja osvoji poen servira sledeću loptu.' },
      { picture: 'scoreboard', caption: 'Set do 25', verdict: null, info: 'Set osvaja ekipa koja prva dođe do 25 poena, ali uz razliku od bar 2 poena. Kod 24:24 igra se dalje — 26:24, 27:25…' },
      { picture: 'fifth-set', caption: 'Peti set do 15', verdict: null, info: 'Ako je 2:2 u setovima, peti (odlučujući) set igra se do 15 poena, takođe uz razliku od 2. Na 8 poena ekipe menjaju strane.' },
      { picture: 'match-sets', caption: 'Ko osvoji 3 seta', verdict: null, info: 'Utakmicu dobija ekipa koja prva osvoji 3 seta. Nema sata — utakmica traje dok neko ne pobedi.' },
    ],
    question: { text: 'Rezultat je 25:24. Je li set gotov?', answer: 'Nije — potrebna je razlika od 2 poena.' },
  },
  {
    id: 'serve',
    title: 'Servis',
    picture: 'serve-zone',
    frames: [
      { picture: 'serve-zone', caption: 'Iza osnovne linije', verdict: 'ok', info: 'Servira se iza osnovne (zadnje) linije, bilo gde po širini terena. Posle sudijskog zvižduka server ima 8 sekundi da udari loptu, jednom rukom.' },
      { picture: 'serve-foot-line', caption: 'Nagazio liniju', verdict: 'bad', info: 'U trenutku udarca server ne sme da stane na osnovnu liniju niti u teren. Ako nagazi — greška, poen protivniku. Posle udarca sme da uskoči u teren.' },
      { picture: 'serve-net', caption: 'Okrzne mrežu — važi', verdict: 'ok', info: 'Ako servirana lopta dotakne mrežu i pređe na drugu stranu između antena, servis važi i igra se nastavlja.' },
      { picture: 'serve-block', caption: 'Servis se ne blokira', verdict: 'bad', info: 'Protivnik ne sme da blokira servis, niti da ga napadne smečom dok je lopta iznad mreže u prednjoj zoni. Servis se prima.' },
    ],
    question: { text: 'Servis okrzne mrežu i padne u protivnički teren. Važi li?', answer: 'Da — to je poen za ekipu koja servira.' },
  },
  {
    id: 'rotation',
    title: 'Rotacija',
    picture: 'rotation',
    frames: [
      { picture: 'rotation', caption: 'Pozicije 1–6', verdict: null, info: 'Mesta na terenu su označena brojevima od 1 do 6. Na poziciji 1 (zadnja desna) je igrač koji servira. Pozicije 2, 3 i 4 su prednja linija, 5, 6 i 1 zadnja.' },
      { picture: 'side-out', caption: 'Osvojiš servis → rotiraš', verdict: null, info: 'Kad ekipa osvoji poen na protivnikovom servisu, svi igrači se pomere za jedno mesto u smeru kazaljke na satu. Igrač koji dođe na poziciju 1 servira.' },
      { picture: 'receive-order', caption: 'Ko prima, stoji po redu', verdict: null, info: 'U trenutku servisa igrači ekipe koja prima stoje po redu rotacije — svako ispred, iza i pored onog do koga treba. Po pravilima od 2025. igrači ekipe koja servira smeju da stoje gde hoće na svojoj polovini.' },
    ],
    question: { text: 'Tvoja ekipa osvoji poen na protivnikov servis. Šta radite?', answer: 'Rotirate za jedno mesto i servirate.' },
  },
  {
    id: 'touches',
    title: 'Tri dodira',
    picture: 'three-touches',
    frames: [
      { picture: 'three-touches', caption: 'Prijem, dizanje, napad', verdict: 'ok', info: 'Ekipa sme da dodirne loptu najviše 3 puta pre nego što je vrati preko mreže. Najčešće: prijem, dizanje i napad (smeč).' },
      { picture: 'four-touches', caption: '4 dodira', verdict: 'bad', info: 'Četvrti dodir je greška — poen dobija protivnik.' },
      { picture: 'block-touch', caption: 'Blok se ne broji', verdict: 'ok', info: 'Dodir lopte u bloku se ne računa u tri dodira. Posle bloka ekipa ima još sva tri dodira, a i igrač koji je blokirao sme ponovo da igra loptu.' },
    ],
    question: { text: 'Posle bloka ekipa ima koliko dodira?', answer: 'Još tri — blok se ne računa.' },
  },
  {
    id: 'contact',
    title: 'Kako se igra lopta',
    picture: 'set-fingers',
    frames: [
      { picture: 'set-fingers', caption: 'Prstima iznad glave', verdict: 'ok', info: 'Odbijanje prstima iznad glave — za dizanje loptu saigraču. Lopta se kratko odbija, ne drži se.' },
      { picture: 'dig-forearms', caption: 'Podlakticama', verdict: 'ok', info: 'Prijem podlakticama (čekić): ruke spojene i ispružene, lopta se odbija od podlaktica. Tako se primaju servis i jaki udarci.' },
      { picture: 'foot-touch', caption: 'I nogom sme', verdict: 'ok', info: 'Lopta sme da dodirne bilo koji deo tela — i nogu. Važno je samo da se odbije, a ne da se uhvati.' },
      { picture: 'double-contact', caption: 'Dvaput zaredom', verdict: 'bad', info: 'Isti igrač ne sme da dodirne loptu dvaput zaredom (dupli dodir). Izuzeci: posle bloka, pri prvom dodiru ekipe u jednom pokretu i — po tumačenju od 2025. — pri dizanju prstima saigraču, ako su dodiri u jednom pokretu.' },
      { picture: 'catch', caption: 'Uhvaćena lopta', verdict: 'bad', info: 'Lopta se ne sme uhvatiti, držati ni baciti. To je „nošena lopta" — poen protivniku.' },
    ],
    question: { text: 'Sme li lopta da se odbije nogom?', answer: 'Sme — svaki deo tela je dozvoljen.' },
  },
  {
    id: 'net',
    title: 'Mreža i srednja linija',
    picture: 'net-touch',
    frames: [
      { picture: 'net-touch', caption: 'Dodir mreže', verdict: 'bad', info: 'Igrač ne sme da dodirne mrežu između antena dok igra loptu (ili pokušava). Greška je i kad se odgurne ili pridrži za mrežu.' },
      { picture: 'center-line-ok', caption: 'Stopalo na liniji', verdict: 'ok', info: 'Ispod mreže je srednja linija. Smeš da pređeš na protivničku stranu stopalom, ali samo ako deo stopala ostane na liniji ili iznad nje.' },
      { picture: 'center-line-bad', caption: 'Celo stopalo preko', verdict: 'bad', info: 'Ako celo stopalo pređe srednju liniju i stane u protivnički teren — greška, poen protivniku.' },
      { picture: 'block-over', caption: 'Blok preko mreže', verdict: 'ok', info: 'Blokeri smeju da pruže ruke preko mreže, ali ne smeju da diraju loptu na protivnikovoj strani pre njegovog napada.' },
    ],
    question: { text: 'Smeš li stopalom da staneš na srednju liniju?', answer: 'Da — ako deo stopala ostane na liniji.' },
  },
  {
    id: 'attack',
    title: 'Napad iz zadnje linije',
    picture: 'back-row-attack',
    frames: [
      { picture: 'back-row-attack', caption: 'Odraz iza linije', verdict: 'ok', info: 'Igrač zadnje linije sme da smečira loptu iznad visine mreže, ali samo ako se odrazi iza linije napada (3 m). Doskok sme da bude i ispred linije.' },
      { picture: 'court-zones', caption: 'Ispred linije — samo prednji', verdict: 'bad', info: 'Ako se igrač zadnje linije odrazi ispred linije napada i udari loptu koja je cela iznad mreže, to je greška. Blokira samo prednja linija.' },
    ],
    question: { text: 'Sme li igrač zadnje linije da blokira?', answer: 'Ne — blokiraju samo igrači prednje linije.' },
  },
  {
    id: 'timeout',
    title: 'Tajm-aut',
    picture: 'timeout',
    frames: [
      { picture: 'timeout', caption: '2 tajm-auta po setu', verdict: null, info: 'Svaka ekipa ima po 2 tajm-auta u svakom setu. Tajm-aut traje 30 sekundi. Traži ga trener (ili, u njegovom odsustvu, pomoćni trener ili kapiten na terenu) kad je lopta van igre.' },
      { picture: 'match-sets', caption: 'Pauza između setova', verdict: null, info: 'Između setova je kratka pauza, a posle svakog seta ekipe menjaju strane terena.' },
    ],
    question: { text: 'Koliko tajm-auta ima ekipa u jednom setu?', answer: '2 (po 30 sekundi).' },
  },
  {
    id: 'cards',
    title: 'Kartoni',
    picture: 'card-red',
    frames: [
      { picture: 'card-yellow', caption: 'Žuti — opomena', verdict: null, info: 'Žuti karton je upozorenje za loše ponašanje. Nema kazne, ali se upisuje u zapisnik.' },
      { picture: 'card-red', caption: 'Crveni — kazna', verdict: 'bad', info: 'Crveni karton je kazna: protivnik dobija poen i servis.' },
      { picture: 'card-expulsion', caption: 'Žuti + crveni zajedno', verdict: 'bad', info: 'Sudija drži oba kartona zajedno u jednoj ruci — isključenje: igrač napušta teren do kraja seta.' },
      { picture: 'card-disqualification', caption: 'Žuti i crveni odvojeno', verdict: 'bad', info: 'Žuti u jednoj, crveni u drugoj ruci — diskvalifikacija: igrač napušta teren do kraja utakmice.' },
    ],
    question: { text: 'Šta protivnik dobija kad igrač dobije crveni karton?', answer: 'Poen i servis.' },
  },
  {
    id: 'mini',
    title: 'Mini odbojka',
    picture: 'mini-teams',
    frames: [
      { picture: 'mini-court', caption: 'Manji teren, niža mreža', verdict: 'ok', info: 'Deca igraju na manjem terenu i sa nižom mrežom, pa lopta lakše prelazi i duže traje igra. Tačne mere zavise od uzrasta i takmičenja.' },
      { picture: 'mini-ball', caption: 'Lakša lopta', verdict: 'ok', info: 'Za decu se koristi lakša i mekša lopta, da prijem i dizanje ne bole i da se lakše nauči tehnika.' },
      { picture: 'mini-teams', caption: '2, 3 ili 4 igrača', verdict: 'ok', info: 'U mini odbojci igra se u manjim ekipama — 2 na 2, 3 na 3 ili 4 na 4 — pa svako dete često dodiruje loptu. I ovde se rotira, pa svako servira.' },
    ],
    question: { text: 'Zašto deca igraju u manjim ekipama?', answer: 'Da svako što češće dodiruje loptu.' },
  },
  {
    id: 'signals',
    title: 'Znakovi sudija',
    picture: 'sig-out',
    frames: [
      { picture: 'sig-in', caption: 'Lopta unutra', verdict: null, info: 'Ruka ispružena prstima ka podu, na strani terena gde je lopta pala — poen.' },
      { picture: 'sig-out', caption: 'Aut', verdict: null, info: 'Obe podlaktice podignute uspravno, dlanovi okrenuti ka sebi — lopta je u autu.' },
      { picture: 'sig-four', caption: 'Četiri dodira', verdict: null, info: 'Podignuta ruka sa četiri raširena prsta — ekipa je dodirnula loptu četiri puta.' },
      { picture: 'sig-double', caption: 'Dupli dodir', verdict: null, info: 'Podignuta ruka sa dva raširena prsta — isti igrač je dodirnuo loptu dvaput zaredom.' },
      { picture: 'sig-catch', caption: 'Nošena lopta', verdict: null, info: 'Podlaktica se polako podiže, dlan okrenut nagore — lopta je uhvaćena ili bačena.' },
      { picture: 'sig-net', caption: 'Dodir mreže', verdict: null, info: 'Sudija dlanom pokaže (dotakne) mrežu na strani igrača koji je napravio grešku.' },
      { picture: 'sig-timeout', caption: 'Tajm-aut', verdict: null, info: 'Dlan jedne ruke na vrhu prstiju druge, kao slovo T, pa pokaže ekipu koja je tražila tajm-aut.' },
      { picture: 'sig-sub', caption: 'Izmena', verdict: null, info: 'Podlaktice se vrte jedna oko druge ispred grudi — izmena igrača.' },
    ],
    question: { text: 'Sudija podigne dva prsta. Šta je dosudio?', answer: 'Dupli dodir.' },
  },
  {
    id: 'fair-play',
    title: 'Fer-plej',
    picture: 'handshake-net',
    frames: [
      { picture: 'handshake-net', caption: 'Pozdrav ispod mreže', verdict: 'ok', info: 'Pre i posle utakmice ekipe se pozdravljaju — rukovanje ispod mreže sa protivnicima i sa sudijama.' },
      { picture: 'high-five', caption: 'Podrži saigrača', verdict: 'ok', info: 'Posle svakog poena — dobijenog ili izgubljenog — saigrači se pozdrave i bodre. Odbojka je igra ekipe.' },
      { picture: 'respect-ref', caption: 'Kapiten priča mirno', verdict: 'ok', info: 'Odluke sudije se ne raspravljaju. Sa sudijom mirno razgovara samo kapiten na terenu.' },
      { picture: 'cheer', caption: 'Bodri, ne vređaj', verdict: 'ok', info: 'Igrači, roditelji i navijači: bodrite sve — deca uče od vas.' },
    ],
    question: { text: 'Ko sme da razgovara sa sudijom tokom utakmice?', answer: 'Kapiten na terenu, mirno.' },
  },
];

export const QUIZ: QuizQuestion[] = [
  { text: 'Koliko igrača jedne ekipe je na terenu?', options: ['5', '6', '7'], correct: 1, explanation: 'Po 6 igrača svake ekipe.' },
  { text: 'Lopta je pala na liniju. Šta je to?', picture: 'ball-on-line', options: ['Aut', 'Unutra — poen', 'Ponavlja se'], correct: 1, explanation: 'U odbojci linija pripada terenu.' },
  { text: 'Koliko puta ekipa sme da dodirne loptu?', options: ['2', '3', '4'], correct: 1, explanation: 'Najviše 3 puta (blok se ne računa).' },
  { text: 'Šta je ovo?', picture: 'catch', options: ['Dozvoljeno', 'Nošena lopta', 'Dupli dodir'], correct: 1, explanation: 'Lopta se ne sme uhvatiti — mora se odbiti.' },
  { text: 'Do koliko poena se igra set?', options: ['15', '21', '25'], correct: 2, explanation: 'Do 25, uz razliku od 2 poena (peti set do 15).' },
  { text: 'Servis okrzne mrežu i pređe. Šta sledi?', picture: 'serve-net', options: ['Servis važi', 'Ponavlja se', 'Poen protivniku'], correct: 0, explanation: 'Servis koji dotakne mrežu i pređe između antena važi.' },
  { text: 'Kada ekipa rotira?', options: ['Posle svakog poena', 'Kad osvoji servis od protivnika', 'Na kraju seta'], correct: 1, explanation: 'Kad osvoji poen na protivnikov servis — pomeri se za jedno mesto u smeru kazaljke na satu.' },
  { text: 'Sme li libero da servira?', picture: 'libero', options: ['Sme', 'Ne sme', 'Samo u petom setu'], correct: 1, explanation: 'Libero igra samo u zadnjoj liniji: ne servira i ne blokira.' },
  { text: 'Šta pokazuje sudija?', picture: 'sig-out', options: ['Aut', 'Tajm-aut', 'Izmena'], correct: 0, explanation: 'Podignute podlaktice sa dlanovima ka sebi — aut.' },
  { text: 'Šta pokazuje sudija?', picture: 'sig-four', options: ['Četiri dodira', 'Četvrti set', 'Četiri izmene'], correct: 0, explanation: 'Četiri raširena prsta — četiri dodira.' },
];

export const RULE_DOCUMENT_GROUPS: RuleDocumentGroup[] = [
  {
    title: 'Zvanična pravila igre',
    description: 'Važe Zvanična pravila odbojke FIVB 2025–2028, za sva takmičenja od 1. januara 2025. Odbojkaški savez Srbije primenjuje međunarodna pravila; prevod na naš jezik objavio je Odbojkaški savez Crne Gore.',
    documents: [
      { title: 'Zvanična pravila odbojke 2025–2028', note: 'prevod OS Crne Gore', url: 'https://oscg.me/wp-content/uploads/2025/09/zvanicnapravila-odbojke-2025-2028-1.pdf', language: 'sr', format: 'PDF' },
      { title: 'Promene u pravilima 2025', note: 'pregled izmena, OS Crne Gore', url: 'https://oscg.me/wp-content/uploads/2025/09/Promjene-u-Pravilima.pdf', language: 'sr', format: 'PDF' },
      { title: 'FIVB Official Volleyball Rules 2025–2028', note: 'zvanična stranica FIVB (pravila, tumačenja, sudijski znaci)', url: 'https://www.fivb.com/volleyball/the-game/official-volleyball-rules/', language: 'en', format: 'sajt' },
    ],
  },
  {
    title: 'Takmičenja u Srbiji',
    description: 'Uputstva Odbojkaškog saveza Srbije za organizaciju utakmica i propozicije liga.',
    documents: [
      { title: 'Uputstvo za organizaciju utakmica 2024', note: 'OSS', url: 'https://liga.ossrb.org/images/doc/propozicije/UputstvozaOrgutakmica2024-1.pdf', language: 'sr', format: 'PDF' },
      { title: 'Odbojkaški savez Srbije', note: 'vesti, takmičenja, mlađe kategorije', url: 'https://www.ossrb.org/', language: 'sr', format: 'sajt' },
    ],
  },
];

export const RULE_SOURCE_URL = 'https://www.fivb.com/volleyball/the-game/official-volleyball-rules/';
