export type HandballPicture =
  | 'court-full'
  | 'court-lines'
  | 'goal-size'
  | 'goal-in'
  | 'goal-on-line'
  | 'team-seven'
  | 'team-bench'
  | 'flying-sub'
  | 'area-keeper'
  | 'area-attacker'
  | 'area-jump'
  | 'area-defender'
  | 'three-steps'
  | 'four-steps'
  | 'three-sec'
  | 'dribble'
  | 'double-dribble'
  | 'body-ok'
  | 'foot-bad'
  | 'throw-in'
  | 'corner-throw'
  | 'keeper-throw'
  | 'throw-off'
  | 'block-ok'
  | 'foul-push'
  | 'foul-hold'
  | 'free-throw'
  | 'card-yellow'
  | 'suspension'
  | 'third-suspension'
  | 'card-blue'
  | 'seven-chance'
  | 'seven-throw'
  | 'seven-keeper'
  | 'passive-warning'
  | 'passive-passes'
  | 'halves'
  | 'timeout-card'
  | 'mini-court'
  | 'mini-ball'
  | 'sig-steps'
  | 'sig-dribble'
  | 'sig-area'
  | 'sig-offensive'
  | 'sig-passive'
  | 'sig-goal'
  | 'sig-suspension'
  | 'sig-timeout'
  | 'handshake'
  | 'help-up'
  | 'respect-ref'
  | 'cheer';

export type RuleVerdict = 'ok' | 'bad' | null;

export type RuleFocus = [number, number, number];

export interface RuleFrame {
  picture?: HandballPicture;
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
  picture?: HandballPicture;
  image?: string;
  frames: RuleFrame[];
  question: { text: string; answer: string };
}

export interface QuizQuestion {
  text: string;
  picture?: HandballPicture;
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
    title: 'Teren i gol',
    picture: 'court-full',
    frames: [
      { picture: 'court-full', caption: '40 × 20 m', verdict: null, info: 'Rukometni teren je dugačak 40 m i širok 20 m. Na sredini svake kraće (gol) linije je gol.' },
      { picture: 'court-lines', caption: '6 m, 7 m, 9 m', verdict: null, info: 'Puna linija na 6 m oivičava prostor golmana. Isprekidana linija na 9 m je linija slobodnog bacanja. Kratka linija na 7 m je mesto za sedmerac, a još kraća na 4 m je granica do koje golman sme da izađe pri sedmercu.' },
      { picture: 'goal-size', caption: 'Gol 3 × 2 m', verdict: null, info: 'Gol je širok 3 m i visok 2 m (mere unutrašnjeg otvora). Stative i prečka su obojene u dve boje koje se ističu u odnosu na pozadinu.' },
      { picture: 'goal-on-line', caption: 'Cela lopta preko linije', verdict: null, info: 'Gol je postignut tek kad cela lopta pređe gol-liniju između stativa i ispod prečke. Lopta na liniji još nije gol. Isto je sa autom: lopta je napolju kad cela pređe liniju.' },
    ],
    question: { text: 'Lopta stoji na gol-liniji, pola unutra. Je li gol?', answer: 'Nije — cela lopta mora da pređe liniju.' },
  },
  {
    id: 'team',
    title: 'Ekipa i izmene',
    picture: 'team-seven',
    frames: [
      { picture: 'team-seven', caption: '6 + golman', verdict: null, info: 'Na terenu je po 7 igrača svake ekipe: 6 igrača u polju i golman u dresu druge boje.' },
      { picture: 'team-bench', caption: 'Do 16 u zapisniku', verdict: null, info: 'U zapisnik može da se upiše najviše 16 igrača. Ostali sede na klupi i čekaju izmenu.' },
      { picture: 'flying-sub', caption: 'Izmene u letu', verdict: 'ok', info: 'Izmene se rade u toku igre, bez prijave sudiji, koliko god puta — ali samo kroz svoju zonu za izmene, i tek kad igrač koji izlazi napusti teren. Nepravilna izmena se kažnjava isključenjem na 2 minuta.' },
    ],
    question: { text: 'Mora li igrač da čeka prekid da bi ušao u igru?', answer: 'Ne — izmene se rade u letu, kroz zonu za izmene.' },
  },
  {
    id: 'goal-area',
    title: 'Prostor golmana',
    picture: 'area-keeper',
    frames: [
      { picture: 'area-keeper', caption: 'Samo golman', verdict: 'ok', info: 'U prostor golmana (do linije od 6 m, zajedno sa linijom) sme da uđe samo golman. Lopta koja se kotrlja ili stoji u prostoru pripada golmanu.' },
      { picture: 'area-attacker', caption: 'Napadač nagazio', verdict: 'bad', info: 'Ako napadač sa loptom stane u prostor golmana ili na liniju, lopta ide golmanu — izvodi izbacaj.' },
      { picture: 'area-jump', caption: 'Skok iznad prostora', verdict: 'ok', info: 'Napadač sme da se odrazi ispred linije, u vazduhu uleti iznad prostora i šutne. Važno je da lopta napusti ruku pre nego što doskoči u prostor.' },
      { picture: 'area-defender', caption: 'Branilac u prostoru', verdict: 'bad', info: 'Ni branilac ne sme da uđe u prostor da bi branio. Ako time stekne prednost — slobodno bacanje za napad; ako time spreči čistu šansu za gol — sedmerac.' },
    ],
    question: { text: 'Napadač se odrazio ispred linije i šutnuo u skoku, pa doskočio u prostor. Važi li gol?', answer: 'Važi — lopta je izašla iz ruke pre doskoka.' },
  },
  {
    id: 'steps',
    title: 'Koraci, sekunde i vođenje',
    picture: 'three-steps',
    frames: [
      { picture: 'three-steps', caption: 'Najviše 3 koraka', verdict: 'ok', info: 'Sa loptom u ruci smeš da napraviš najviše 3 koraka. Ako uhvatiš loptu u vazduhu, doskok na jednu ili obe noge se ne računa kao korak.' },
      { picture: 'four-steps', caption: '4. korak — koraci', verdict: 'bad', info: 'Četvrti korak sa loptom u ruci su „koraci". Lopta ide protivniku — slobodno bacanje.' },
      { picture: 'three-sec', caption: 'Najviše 3 sekunde', verdict: null, info: 'Loptu smeš da držiš najviše 3 sekunde — i kad stojiš, i kad lopta leži na podu.' },
      { picture: 'dribble', caption: '3 koraka – vođenje – 3 koraka', verdict: 'ok', info: 'Loptu smeš da vodiš jednom rukom koliko hoćeš. Kad je uhvatiš, imaš opet najviše 3 koraka i 3 sekunde da je dodaš ili šutneš.' },
      { picture: 'double-dribble', caption: 'Ponovo vođenje', verdict: 'bad', info: 'Kad uhvatiš loptu posle vođenja, ne smeš ponovo da je vodiš (dupla lopta). Lopta ide protivniku.' },
    ],
    question: { text: 'Uhvatio si loptu posle vođenja. Koliko koraka smeš?', answer: 'Još najviše 3 — ali ne smeš ponovo da vodiš.' },
  },
  {
    id: 'ball',
    title: 'Čime se igra lopta',
    picture: 'body-ok',
    frames: [
      { picture: 'body-ok', caption: 'Ruke, glava, telo', verdict: 'ok', info: 'Loptu smeš da bacaš, hvataš, zaustavljaš i odbijaš rukama, glavom, trupom, butinama i kolenima.' },
      { picture: 'foot-bad', caption: 'Ispod kolena — ne', verdict: 'bad', info: 'Igrač u polju ne sme da dodirne loptu nogom ispod kolena — osim kad ga protivnik pogodi loptom. Golman u svom prostoru sme da brani i nogama.' },
    ],
    question: { text: 'Sme li igrač u polju da zaustavi loptu stopalom?', answer: 'Ne — samo golman, u svom prostoru.' },
  },
  {
    id: 'restarts',
    title: 'Aut i izbacaj',
    picture: 'throw-in',
    frames: [
      { picture: 'throw-in', caption: 'Aut — noga na liniji', verdict: null, info: 'Kad lopta pređe bočnu liniju, aut izvodi protivnik ekipe koja ju je poslednja dotakla — sa mesta gde je izašla, jednom nogom na bočnoj liniji. Protivnici moraju da budu bar 3 m od izvođača.' },
      { picture: 'corner-throw', caption: 'Aut iz ugla', verdict: null, info: 'Ako lopta pređe gol-liniju pored gola, a poslednji ju je dotakao branilac (ne golman), napad izvodi aut iz ugla terena.' },
      { picture: 'keeper-throw', caption: 'Izbacaj golmana', verdict: null, info: 'Ako je loptu poslednji dotakao napadač ili golman, pa ona pređe gol-liniju pored gola — golman izvodi izbacaj iz svog prostora.' },
      { picture: 'throw-off', caption: 'Posle gola — centar', verdict: null, info: 'Utakmica počinje, a posle svakog gola se nastavlja, izvođenjem sa centra terena. Posle gola centar izvodi ekipa koja je primila gol, a izvođač ima 3 sekunde od zvižduka.' },
    ],
    question: { text: 'Branilac izbije loptu preko gol-linije pored gola. Šta sledi?', answer: 'Aut iz ugla za napad.' },
  },
  {
    id: 'fouls',
    title: 'Kontakt i faul',
    picture: 'block-ok',
    frames: [
      { picture: 'block-ok', caption: 'Blokada telom', verdict: 'ok', info: 'Branilac sme telom (trupom) da stane ispred napadača i zatvori mu put, i savijenim rukama da kontroliše njegovo kretanje. Sme i otvorenom šakom da izbije loptu.' },
      { picture: 'foul-push', caption: 'Guranje i udaranje', verdict: 'bad', info: 'Ne sme se gurati, udarati, saplitati ni naletati na protivnika. Takođe se ne sme izbijati lopta iz ruke koja je drži.' },
      { picture: 'foul-hold', caption: 'Držanje', verdict: 'bad', info: 'Ne sme se držati protivnik za ruku, telo ili dres.' },
      { picture: 'free-throw', caption: 'Slobodno bacanje', verdict: null, info: 'Za faul napad izvodi slobodno bacanje sa mesta prekršaja. Ako je faul bio između 6 i 9 m, bacanje se izvodi sa isprekidane linije od 9 m. Protivnici moraju da budu bar 3 m od izvođača.' },
    ],
    question: { text: 'Sme li branilac telom da stane ispred napadača?', answer: 'Sme — to je dozvoljena blokada.' },
  },
  {
    id: 'punishments',
    title: 'Opomena, 2 minuta, crveni',
    picture: 'suspension',
    frames: [
      { picture: 'card-yellow', caption: 'Žuti — opomena', verdict: null, info: 'Opomena je žuti karton. Igrač dobija najviše jednu opomenu, a cela ekipa najviše tri. Posle toga kazna je najmanje 2 minuta.' },
      { picture: 'suspension', caption: '2 minuta van igre', verdict: 'bad', info: 'Isključenje traje 2 minuta igre. Sudija podigne ruku sa dva prsta. Za to vreme ekipa igra sa jednim igračem manje.' },
      { picture: 'third-suspension', caption: 'Treće isključenje = crveni', verdict: 'bad', info: 'Treće isključenje istog igrača znači diskvalifikaciju — crveni karton. Igrač napušta teren i klupu; ekipa 2 minuta igra sa igračem manje, a onda sme da uđe drugi igrač. Za grub faul crveni karton može da dobije i odmah.' },
      { picture: 'card-blue', caption: 'Plavi — prijava', verdict: null, info: 'Posle crvenog kartona sudija ponekad pokaže i plavi karton. To znači da piše prijavu takmičarskoj komisiji, koja može da produži kaznu.' },
    ],
    question: { text: 'Koliko traje isključenje?', answer: '2 minuta igre.' },
  },
  {
    id: 'seven-metre',
    title: 'Sedmerac',
    picture: 'seven-throw',
    frames: [
      { picture: 'seven-chance', caption: 'Uništena čista šansa', verdict: 'bad', info: 'Sedmerac se dosuđuje kad branilac nedozvoljeno spreči čistu priliku za gol — faulom ili ulaskom u prostor golmana.' },
      { picture: 'seven-throw', caption: 'Šut za 3 sekunde', verdict: null, info: 'Izvođač stoji iza linije od 7 m i posle zvižduka ima 3 sekunde da šutne na gol. Ne sme da dodirne ni pređe liniju dok lopta ne napusti ruku. Ostali igrači čekaju iza linije od 9 m.' },
      { picture: 'seven-keeper', caption: 'Golman do 4 m', verdict: null, info: 'Golman sme da izađe najdalje do linije od 4 m, dok lopta ne napusti izvođačevu ruku. Ako pređe ranije, a gol ne padne, sedmerac se ponavlja.' },
    ],
    question: { text: 'Koliko sekundi izvođač ima za sedmerac?', answer: '3 sekunde od zvižduka.' },
  },
  {
    id: 'passive',
    title: 'Pasivna igra',
    picture: 'passive-warning',
    frames: [
      { picture: 'passive-warning', caption: 'Podignuta ruka', verdict: null, info: 'Ekipa ne sme da drži loptu bez pokušaja da napadne. Kad sudija primeti pasivnu igru, podigne ruku — to je upozorenje.' },
      { picture: 'passive-passes', caption: 'Najviše 4 dodavanja', verdict: 'bad', info: 'Posle upozorenja napad ima najviše 4 dodavanja da šutne na gol. Ako primi peto dodavanje bez šuta, lopta ide protivniku — slobodno bacanje.' },
    ],
    question: { text: 'Sudija je podigao ruku. Koliko dodavanja napad ima?', answer: 'Najviše 4 — pa mora šut.' },
  },
  {
    id: 'time',
    title: 'Trajanje i tajm-aut',
    picture: 'halves',
    frames: [
      { picture: 'halves', caption: '2 × 30 minuta', verdict: null, info: 'Utakmica ima 2 poluvremena po 30 minuta (od 16 godina naviše), sa pauzom od 10 minuta. Mlađi igraju kraće: 2 × 25 minuta (12–16 godina) i 2 × 20 minuta (8–12 godina).' },
      { picture: 'timeout-card', caption: 'Zeleni karton', verdict: null, info: 'Ekipa traži tajm-aut zelenim kartonom, samo dok je lopta kod nje. Tajm-aut traje 1 minut; ekipa najčešće ima 3 po utakmici, najviše 2 u jednom poluvremenu.' },
    ],
    question: { text: 'Koliko traje poluvreme za igrače od 16 godina naviše?', answer: '30 minuta.' },
  },
  {
    id: 'mini',
    title: 'Mini rukomet',
    picture: 'mini-court',
    frames: [
      { picture: 'mini-court', caption: 'Manji teren i gol', verdict: 'ok', info: 'Najmlađi igraju mini rukomet: na manjem terenu, na manje golove i sa manje igrača. Tačna pravila zavise od uzrasta i takmičenja.' },
      { picture: 'mini-ball', caption: 'Manja lopta', verdict: 'ok', info: 'Lopta je manja i lakša: veličina 1 za devojčice od 8 do 14 i dečake od 8 do 12 godina, veličina 2 za starije devojčice, žene i dečake od 12 do 16, a veličina 3 za muškarce. Za mini rukomet koristi se još manja i mekša lopta.' },
      { picture: 'cheer', caption: 'Svi igraju', verdict: 'ok', info: 'U mini rukometu najvažnije je da svako dete igra, dodaje i šutira. Rezultat je u drugom planu.' },
    ],
    question: { text: 'Koju veličinu lopte koriste dečaci od 8 do 12 godina?', answer: 'Veličinu 1.' },
  },
  {
    id: 'signals',
    title: 'Znakovi sudija',
    picture: 'sig-suspension',
    frames: [
      { picture: 'sig-steps', caption: 'Koraci / 3 sekunde', verdict: null, info: 'Podlaktice se vrte jedna oko druge ispred grudi — koraci ili držanje lopte duže od 3 sekunde.' },
      { picture: 'sig-dribble', caption: 'Dupla lopta', verdict: null, info: 'Ispružene ruke, dlanovi okrenuti nadole, naizmenično se pomeraju gore-dole — nepravilno vođenje.' },
      { picture: 'sig-area', caption: 'Ulazak u prostor', verdict: null, info: 'Ruka ispružena napred, dlan nadole — igrač je ušao u prostor golmana.' },
      { picture: 'sig-offensive', caption: 'Napadački faul', verdict: null, info: 'Obe ruke iznad glave, dlanovi spojeni — napadač je napravio faul.' },
      { picture: 'sig-passive', caption: 'Pasivna igra', verdict: null, info: 'Ruke podignute i ukrštene iznad glave — upozorenje za pasivnu igru.' },
      { picture: 'sig-goal', caption: 'Gol', verdict: null, info: 'Jedna ruka podignuta uvis, otvorena šaka — gol je postignut.' },
      { picture: 'sig-suspension', caption: '2 minuta', verdict: null, info: 'Ruka podignuta sa dva prsta, a druga pokazuje isključenog igrača.' },
      { picture: 'sig-timeout', caption: 'Tajm-aut', verdict: null, info: 'Šake iznad glave u obliku slova T — sat se zaustavlja.' },
    ],
    question: { text: 'Sudija podigne ruku sa dva prsta. Šta je dosudio?', answer: 'Isključenje na 2 minuta.' },
  },
  {
    id: 'fair-play',
    title: 'Fer-plej',
    picture: 'handshake',
    frames: [
      { picture: 'handshake', caption: 'Pozdravi protivnika', verdict: 'ok', info: 'Pozdravi protivnika i sudije pre i posle utakmice.' },
      { picture: 'help-up', caption: 'Pomozi da ustane', verdict: 'ok', info: 'Rukomet je igra sa puno kontakta. Kad protivnik padne, pomozi mu da ustane.' },
      { picture: 'respect-ref', caption: 'Kapiten priča mirno', verdict: 'ok', info: 'Odluke sudije se ne raspravljaju. Sa sudijom mirno razgovaraju kapiten i službeno lice ekipe.' },
      { picture: 'cheer', caption: 'Bodri, ne vređaj', verdict: 'ok', info: 'Igrači, roditelji i navijači: bodrite sve — deca uče od vas.' },
    ],
    question: { text: 'Šta radiš kad protivnik padne?', answer: 'Pomogneš mu da ustane.' },
  },
];

export const QUIZ: QuizQuestion[] = [
  { text: 'Koliko igrača jedne ekipe je na terenu?', options: ['6', '7 (6 + golman)', '8'], correct: 1, explanation: '6 igrača u polju i golman.' },
  { text: 'Ko sme da stoji u prostoru golmana?', picture: 'area-keeper', options: ['Svi', 'Samo golman', 'Golman i branioci'], correct: 1, explanation: 'U prostor golmana sme samo golman.' },
  { text: 'Koliko koraka smeš sa loptom u ruci?', options: ['2', '3', '4'], correct: 1, explanation: 'Najviše 3 koraka.' },
  { text: 'Koliko dugo smeš da držiš loptu?', options: ['3 sekunde', '5 sekundi', 'Koliko hoćeš'], correct: 0, explanation: 'Najviše 3 sekunde.' },
  { text: 'Šta je ovo?', picture: 'double-dribble', options: ['Dozvoljeno', 'Dupla lopta', 'Pasivna igra'], correct: 1, explanation: 'Posle hvatanja ne smeš ponovo da vodiš.' },
  { text: 'Sme li igrač u polju da šutne loptu nogom?', picture: 'foot-bad', options: ['Sme', 'Ne sme', 'Samo na centru'], correct: 1, explanation: 'Igrač u polju ne sme da igra nogom ispod kolena.' },
  { text: 'Koliko traje isključenje?', options: ['1 minut', '2 minuta', 'Do kraja poluvremena'], correct: 1, explanation: '2 minuta igre; ekipa igra sa igračem manje.' },
  { text: 'Šta donosi uništena čista šansa za gol?', options: ['Aut', 'Sedmerac', 'Izbacaj golmana'], correct: 1, explanation: 'Sedmerac — šut sa 7 m.' },
  { text: 'Šta pokazuje sudija?', picture: 'sig-passive', options: ['Gol', 'Upozorenje za pasivnu igru', 'Tajm-aut'], correct: 1, explanation: 'Ukrštene ruke iznad glave — upozorenje za pasivnu igru.' },
  { text: 'Kada je gol postignut?', picture: 'goal-on-line', options: ['Kad lopta dotakne liniju', 'Kad cela lopta pređe gol-liniju', 'Kad pogodi stativu'], correct: 1, explanation: 'Cela lopta mora da pređe gol-liniju između stativa.' },
];

const IHF = 'https://www.ihf.info/sites/default/files/';

export const RULE_DOCUMENT_GROUPS: RuleDocumentGroup[] = [
  {
    title: 'Zvanična pravila igre',
    description: 'Važe IHF Pravila igre (dvoranski rukomet), izdanje od 1. jula 2025. Takmičenja u Srbiji igraju se po pravilima IHF; javno objavljen prevod aktuelnog izdanja na naš jezik nismo našli, pa je ovde zvanični tekst na engleskom.',
    documents: [
      { title: 'IHF Rules of the Game — Indoor Handball (1. jul 2025)', note: 'pravila, komentari, sudijski znaci, pojašnjenja', url: `${IHF}2025-07/09A%20-%20Rules%20of%20the%20Game_Indoor%20Handball_E.pdf`, language: 'en', format: 'PDF' },
      { title: 'Izmene pravila od 1. jula 2025', note: 'IHF — šta je novo (pogodak u glavu, koraci, centar)', url: 'https://www.ihf.info/media-center/news/amended-rules-game-enforced-1-july-2025', language: 'en', format: 'sajt' },
      { title: 'IHF Regulations & Documents', note: 'sva dokumenta IHF, uključujući i pravila za rukomet na pesku', url: 'https://www.ihf.info/regulations-documents', language: 'en', format: 'sajt' },
    ],
  },
];

export const RULE_SOURCE_URL = `${IHF}2025-07/09A%20-%20Rules%20of%20the%20Game_Indoor%20Handball_E.pdf`;
