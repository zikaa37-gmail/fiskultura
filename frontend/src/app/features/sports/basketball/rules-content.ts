export type RulePicture =
  | 'court-full'
  | 'court-hoop'
  | 'court-halves'
  | 'court-paint'
  | 'shot-spots'
  | 'shot-line-foot'
  | 'scoreboard'
  | 'team-five'
  | 'team-sub'
  | 'team-bench'
  | 'jump-ball'
  | 'held-ball'
  | 'possession-arrow'
  | 'dribble-ok'
  | 'dribble-two-hands'
  | 'travel'
  | 'two-steps'
  | 'pivot'
  | 'carry'
  | 'ball-in'
  | 'ball-on-line'
  | 'ball-out'
  | 'foot-on-line'
  | 'throw-in'
  | 'clock-24'
  | 'clock-14'
  | 'eight-sec'
  | 'three-sec'
  | 'five-sec-guarded'
  | 'backcourt-ok'
  | 'backcourt-bad'
  | 'backcourt-steal'
  | 'foul-push'
  | 'foul-hold'
  | 'foul-shooter'
  | 'foul-charge'
  | 'foul-five'
  | 'team-fouls'
  | 'team-fouls-bonus'
  | 'tech-argue'
  | 'tech-flop'
  | 'unsportsmanlike'
  | 'ejection'
  | 'quarters'
  | 'overtime'
  | 'timeout'
  | 'mini-ball'
  | 'mini-everyone'
  | 'mini-no-zone'
  | 'sig-three-try'
  | 'sig-three-made'
  | 'sig-travel'
  | 'sig-double'
  | 'sig-foul'
  | 'sig-sub'
  | 'sig-no-basket'
  | 'handshake'
  | 'help-up'
  | 'cheer'
  | 'respect-ref';

export type RuleVerdict = 'ok' | 'bad' | null;

export type RuleFocus = [number, number, number];

export interface RuleFrame {
  picture?: RulePicture;
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
  picture?: RulePicture;
  image?: string;
  frames: RuleFrame[];
  question: { text: string; answer: string };
}

export interface QuizQuestion {
  text: string;
  picture?: RulePicture;
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
    title: 'Teren',
    picture: 'court-full',
    frames: [
      { image: '/slike/kosarka/photos/arena.jpg', caption: 'Dvorana i teren', verdict: null, info: 'Košarka se igra u dvorani, na terenu od parketa sa dva koša. Oko terena su klupe za igrače, zapisnički sto i gledaoci.' },
      { picture: 'court-full', caption: '28 × 15 m', verdict: null, info: 'Teren je dugačak 28 m i širok 15 m. Linije koje ga okružuju NISU deo terena — ko ih dotakne sa loptom, u autu je.' },
      { picture: 'court-hoop', caption: 'Koš na 3,05 m', verdict: null, info: 'Obruč je na visini od 3,05 m — isto za decu i za seniore u zvaničnim takmičenjima.' },
      { picture: 'court-paint', caption: 'Reket', verdict: null, info: 'Pravougaonik ispod koša je „reket" (ograničeni prostor), dubok 5,80 m — do linije slobodnih bacanja. Luk za tri poena je dalje: 6,75 m od koša.' },
      { picture: 'court-halves', caption: 'Zadnje i prednje polje', verdict: null, info: 'Srednja linija deli teren na zadnje polje (gde braniš svoj koš) i prednje polje (gde napadaš protivnički koš).' },
    ],
    question: { text: 'Linija oko terena — u terenu ili u autu?', answer: 'U autu! Linija nije deo terena.' },
  },
  {
    id: 'points',
    title: 'Koliko vredi koš',
    picture: 'shot-spots',
    frames: [
      {
        picture: 'shot-spots',
        caption: 'Dodirni loptu!',
        verdict: null,
        interactive: true,
        info: 'Slobodno bacanje (sa linije slobodnih bacanja, bez ometanja) vredi 1 poen. Koš iz igre unutar luka vredi 2 poena. Koš iza luka vredi 3 poena. Gleda se gde su šuterove noge kad se odrazi — šta se desi u vazduhu i gde doskoči nije važno. Luk je 6,75 m od koša, a u uglovima 6,60 m.',
      },
      { picture: 'shot-line-foot', caption: 'Peta na liniji = 2', verdict: null, info: 'Linija pripada prostoru za dva poena. Ako šuter makar petom stoji na liniji kad se odrazi, koš vredi 2 poena.' },
      { image: '/slike/kosarka/signals/three-points.jpg', caption: 'Sudija pokazuje 3', verdict: null, info: 'Pri šutu iza luka sudija podigne jednu ruku sa tri prsta (pokušaj za tri). Kad lopta uđe, podigne obe ruke — koš vredi 3 poena.' },
      { picture: 'scoreboard', caption: 'Više poena pobeđuje', verdict: null, info: 'Pobeđuje ekipa koja na kraju ima više poena. Nerešenog rezultata nema — igra se produžetak od 5 minuta dok neko ne vodi.' },
    ],
    question: { text: 'Šuter je petom na liniji za tri. Koliko vredi koš?', answer: '2 poena.' },
  },
  {
    id: 'team',
    title: 'Ekipa i izmene',
    image: '/slike/kosarka/photos/team-court.jpg',
    frames: [
      { image: '/slike/kosarka/photos/team-court.jpg', caption: '5 protiv 5', verdict: null, info: 'Na terenu je po 5 igrača svake ekipe.' },
      { image: '/slike/kosarka/photos/bench.jpg', caption: 'Do 12 u zapisniku', verdict: null, info: 'U zapisnik može da se upiše najviše 12 igrača. Ostali čekaju na klupi i bodre.' },
      { image: '/slike/kosarka/signals/substitution.jpg', caption: 'Izmena — sudija zove', verdict: null, info: 'Igrač koji ulazi čeka kod zapisničkog stola. Ulazi tek kad je igra prekinuta i sudija ga pozove (prekrštene ruke). Broj izmena nije ograničen.' },
    ],
    question: { text: 'Sme li igrač da uleti u igru dok igra teče?', answer: 'Ne — samo kad je igra prekinuta i sudija pozove.' },
  },
  {
    id: 'jump-ball',
    title: 'Početak i posed lopte',
    image: '/slike/kosarka/photos/jump-ball.jpg',
    frames: [
      { image: '/slike/kosarka/photos/jump-ball.jpg', focus: [41, 9, 9], caption: 'Sudijsko bacanje', verdict: null, info: 'Utakmica počinje u centralnom krugu: sudija baci loptu uvis između dva igrača, a oni je udaraju rukom ka saigračima. To je jedino sudijsko bacanje na utakmici.' },
      { image: '/slike/kosarka/signals/held-ball.jpg', caption: 'Obojica drže loptu', verdict: null, info: 'Kad igrači obe ekipe istovremeno čvrsto drže loptu, sudija prekida igru — to je „držanje lopte". Lopta se NE baca ponovo uvis.' },
      { picture: 'possession-arrow', caption: 'Strelica kaže ko', verdict: null, info: 'Loptu dobija ekipa na koju pokazuje strelica na zapisničkom stolu. Posle toga se strelica okreće na drugu stranu — sledeći put loptu dobija druga ekipa.' },
    ],
    question: { text: 'Dvojica drže loptu. Baca li sudija ponovo uvis?', answer: 'Ne — strelica odlučuje ko dobija loptu.' },
  },
  {
    id: 'dribble',
    title: 'Vođenje i koraci',
    image: '/slike/kosarka/photos/dribble-kids.jpg',
    frames: [
      { image: '/slike/kosarka/photos/dribble-kids.jpg', focus: [25, 25, 14], caption: 'Jednom rukom', verdict: 'ok', info: 'Loptu vodiš jednom rukom, odbijajući je o pod. Ruke smeš da menjaš.' },
      { image: '/slike/kosarka/signals/double-dribble.jpg', caption: 'Vođenje sa obe ruke – dupla lopta', verdict: 'bad', info: 'Dupla lopta: vođenje obema rukama odjednom, ili ponovno vođenje pošto si uhvatio loptu. Lopta ide protivniku.' },
      { picture: 'two-steps', caption: 'Dva koraka', verdict: 'ok', info: 'Kad uhvatiš loptu u trku, smeš da napraviš dva koraka — pa šut ili dodavanje.' },
      { image: '/slike/kosarka/signals/travel.jpg', caption: '3. korak – koraci', verdict: 'bad', info: 'Treći korak sa loptom u rukama su koraci. Lopta ide protivniku.' },
      { picture: 'pivot', caption: 'Pivot', verdict: 'ok', info: 'Dok stojiš sa loptom, jedna noga je „stajna": oko nje smeš da se okrećeš drugom nogom koliko hoćeš, ali stajnu ne smeš da podigneš pa vratiš na pod.' },
      { image: '/slike/kosarka/signals/carry.jpg', caption: 'Nošena lopta', verdict: 'bad', info: 'Tokom vođenja ne smeš da podmetneš dlan ispod lopte i da je nosiš. Lopta ide protivniku.' },
    ],
    question: { text: 'Uhvatio si loptu u trku. Koliko koraka smeš?', answer: 'Dva.' },
  },
  {
    id: 'out',
    title: 'Aut',
    picture: 'ball-on-line',
    frames: [
      { picture: 'ball-in', caption: 'U terenu', verdict: 'ok', info: 'Lopta je u igri dok je u terenu i ne dodiruje liniju.' },
      { picture: 'ball-on-line', caption: 'Na liniji', verdict: 'bad', info: 'Lopta koja dotakne liniju je u autu — linija nije deo terena.' },
      { picture: 'ball-out', caption: 'Van terena', verdict: 'bad', info: 'Lopta van terena je aut. Ubacuje ekipa čiji igrač NIJE poslednji dotakao loptu.' },
      { picture: 'foot-on-line', caption: 'Noga na liniji', verdict: 'bad', info: 'I igrač sa loptom koji stane na liniju je u autu — lopta ide protivniku.' },
      { image: '/slike/kosarka/photos/throw-in-kids.jpg', focus: [36, 85, 12], caption: 'Ubacivanje — 5 s', verdict: null, info: 'Igrač koji ubacuje loptu iz auta ima 5 sekundi da je doda u teren.' },
    ],
    question: { text: 'Lopta se odbije od protivnika i ode u aut. Ko ubacuje?', answer: 'Tvoja ekipa.' },
  },
  {
    id: 'clock',
    title: 'Sekunde',
    image: '/slike/kosarka/photos/shot-clock-24.jpg',
    frames: [
      { image: '/slike/kosarka/photos/shot-clock-24.jpg', focus: [74, 37, 10], caption: '24 s za šut', verdict: null, info: 'Ekipa ima 24 sekunde da šutira, a lopta posle šuta mora da dodirne obruč.' },
      { image: '/slike/kosarka/photos/shot-clock-14.jpg', focus: [77, 35, 10], caption: '14 s posle skoka', verdict: null, info: 'Ako lopta dodirne obruč i napad ponovo uhvati skok, sat se vraća na 14 sekundi.' },
      { image: '/slike/kosarka/signals/eight-seconds.jpg', caption: '8 s preko pola', verdict: null, info: 'Iz zadnjeg u prednje polje lopta mora da pređe za 8 sekundi.' },
      { image: '/slike/kosarka/signals/three-seconds.jpg', caption: 'Najviše 3 s u reketu', verdict: 'bad', info: 'Napadač ne sme da stoji u protivničkom reketu duže od 3 sekunde dok njegova ekipa napada.' },
      { image: '/slike/kosarka/signals/five-seconds.jpg', caption: '5 s kad te čuvaju', verdict: null, info: 'Kad te protivnik blisko čuva dok držiš loptu, moraš da je dodaš, šutneš ili počneš da vodiš za 5 sekundi.' },
    ],
    question: { text: 'Koliko sekundi ima napad?', answer: '24 (14 posle skoka u napadu).' },
  },
  {
    id: 'backcourt',
    title: 'Nazad preko pola',
    picture: 'backcourt-bad',
    frames: [
      { picture: 'backcourt-ok', caption: 'Napred', verdict: 'ok', info: 'Ekipa prenosi loptu iz zadnjeg u prednje polje.' },
      { image: '/slike/kosarka/signals/backcourt.jpg', caption: 'Nazad — ne!', verdict: 'bad', info: 'Kad je lopta u prednjem polju, tvoja ekipa ne sme da je vrati u zadnje polje. Lopta ide protivniku.' },
      { picture: 'backcourt-steal', caption: 'Protivnik izbio — smeš', verdict: 'ok', info: 'Ako je protivnik poslednji dotakao loptu i ona ode u tvoje zadnje polje, smeš da je uzmeš.' },
    ],
    question: { text: 'Protivnik izbije loptu u tvoje zadnje polje. Smeš li da je uzmeš?', answer: 'Da!' },
  },
  {
    id: 'foul',
    title: 'Faul',
    image: '/slike/kosarka/signals/pushing.jpg',
    frames: [
      { image: '/slike/kosarka/signals/pushing.jpg', caption: 'Guranje', verdict: 'bad', info: 'Lična greška je nedozvoljen kontakt: guranje, držanje, udaranje po ruci, saplitanje.' },
      { image: '/slike/kosarka/signals/holding.jpg', caption: 'Držanje', verdict: 'bad', info: 'Ne smeš da držiš protivnika za ruku ili dres. Njegova ekipa dobija loptu (ili bacanja kad je bonus).' },
      { image: '/slike/kosarka/signals/charging.jpg', caption: 'Zalet u igrača', verdict: 'bad', info: 'Napadač ne sme da se zaleti u branioca koji već stoji na svom mestu — to je napadački faul.' },
      { image: '/slike/kosarka/photos/shooting-foul.jpg', focus: [52, 38, 16], caption: 'Faul na šuteru', verdict: null, info: 'Fauliran šuter dobija 2 ili 3 slobodna bacanja. Ako je koš ipak ušao — koš važi i dobija još 1 bacanje.' },
      { picture: 'foul-five', caption: '5 faulova = klupa', verdict: null, info: 'Igrač koji napravi 5 ličnih grešaka do kraja utakmice sedi na klupi.' },
    ],
    question: { text: 'Fauliran šuter je ipak dao koš za dva. Šta sledi?', answer: 'Koš važi + 1 slobodno bacanje.' },
  },
  {
    id: 'team-fouls',
    title: 'Timske greške',
    picture: 'team-fouls',
    frames: [
      { picture: 'team-fouls', caption: '4 su granica', verdict: null, info: 'Zapisničar broji faulove cele ekipe u svakoj četvrtini. U novoj četvrtini brojanje kreće od nule.' },
      { image: '/slike/kosarka/photos/free-throws.jpg', focus: [15, 75, 10], caption: 'Od 5. → 2 bacanja', verdict: null, info: 'Posle 4 timske greške u četvrtini, za svaki sledeći faul (osim napadačkog) protivnik dobija 2 slobodna bacanja.' },
    ],
    question: { text: 'Ekipa ima 4 greške u četvrtini. Šta donosi peti faul?', answer: '2 slobodna bacanja protivniku.' },
  },
  {
    id: 'technical',
    title: 'Tehnička i nesportska',
    image: '/slike/kosarka/signals/technical.jpg',
    frames: [
      { image: '/slike/kosarka/signals/technical.jpg', caption: 'Svađa → T', verdict: 'bad', info: 'Tehnička greška je loše ponašanje bez kontakta: svađa sa sudijom, vređanje, kašnjenje igre. Protivnik dobija 1 slobodno bacanje.' },
      { picture: 'tech-flop', caption: 'Glumljenje', verdict: 'bad', info: 'Pad bez kontakta da bi se „izvukao" faul — prvo opomena, pa tehnička greška.' },
      { image: '/slike/kosarka/signals/unsportsmanlike.jpg', caption: 'Grub faul → U', verdict: 'bad', info: 'Nesportska greška je kontakt bez pokušaja da se igra loptom ili previše grub kontakt. Protivnik dobija bacanja i loptu.' },
      { image: '/slike/kosarka/signals/disqualifying.jpg', caption: 'Dve = napolje', verdict: 'bad', info: 'Dve tehničke, dve nesportske ili jedna tehnička i jedna nesportska — igrač se isključuje iz utakmice.' },
    ],
    question: { text: 'Igrač je pao bez kontakta da bi dobio faul. Šta može da dobije?', answer: 'Opomenu, pa tehničku grešku.' },
  },
  {
    id: 'game-time',
    title: 'Trajanje i tajm-aut',
    image: '/slike/kosarka/photos/timeout-huddle.jpg',
    frames: [
      { picture: 'quarters', caption: '4 × 10 minuta', verdict: null, info: 'Utakmica ima 4 četvrtine po 10 minuta (mlađe kategorije kraće). Odmor između četvrtina je 2 minuta, na poluvremenu 15. Sat staje kad sudija svira.' },
      { picture: 'overtime', caption: 'Produžetak 5 minuta', verdict: null, info: 'Ako je nerešeno, igra se produžetak od 5 minuta — koliko god puta treba.' },
      { image: '/slike/kosarka/photos/timeout-huddle.jpg', caption: 'Tajm-aut', verdict: null, info: 'Tajm-aut traje 1 minut. Trener ima 2 u prvom poluvremenu, 3 u drugom i 1 u svakom produžetku. Sudija ga pokazuje rukama kao slovo T.' },
    ],
    question: { text: 'Koliko minuta igre ima utakmica bez produžetka?', answer: '40 (4 × 10).' },
  },
  {
    id: 'minibasket',
    title: 'Mini-košarka',
    picture: 'mini-everyone',
    frames: [
      { picture: 'mini-ball', caption: 'Manja lopta', verdict: 'ok', info: 'Mini-košarka (U10 i U11) igra se manjom loptom (broj 6), 4 × 8 minuta. Napad traje 35 sekundi.' },
      { image: '/slike/kosarka/photos/girls-team.jpg', caption: 'Svako dete igra', verdict: 'ok', info: 'Prvu četvrtinu igra jedna petorka, drugu druga — bez izmena. Treću i četvrtu bira trener. Ekipa mora da ima bar 10 igrača.' },
      { picture: 'mini-no-zone', caption: 'Svako čuva svog', verdict: 'ok', info: 'Zonska odbrana je zabranjena — svako čuva svog igrača. Najvažnije je igrati i učiti, ne rezultat.' },
    ],
    question: { text: 'Može li u mini-košarci ista petorka da igra prvu i drugu četvrtinu?', answer: 'Ne — svako dete mora da igra.' },
  },
  {
    id: 'signals',
    title: 'Znakovi sudija',
    image: '/slike/kosarka/signals/foul.jpg',
    frames: [
      { image: '/slike/kosarka/signals/foul.jpg', caption: 'Faul', verdict: null, info: 'Stisnuta pesnica uvis — lična greška. Zatim sudija prstima pokaže broj igrača zapisničaru.' },
      { image: '/slike/kosarka/signals/travel.jpg', caption: 'Koraci', verdict: null, info: 'Šake se vrte jedna oko druge ispred tela.' },
      { image: '/slike/kosarka/signals/double-dribble.jpg', caption: 'Dupla lopta', verdict: null, info: 'Dlanovi se naizmenično pomeraju gore-dole, kao pri vođenju.' },
      { image: '/slike/kosarka/signals/three-points.jpg', caption: 'Tri poena', verdict: null, info: 'Jedna ruka gore sa tri prsta — pokušaj za tri. Obe ruke gore — koš za tri je ušao.' },
      { image: '/slike/kosarka/signals/shot-clock.jpg', caption: '24 sekunde', verdict: null, info: 'Prsti dodiruju rame — istekao je sat za napad (24 sekunde), lopta ide protivniku.' },
      { image: '/slike/kosarka/signals/timeout.jpg', caption: 'Tajm-aut', verdict: null, info: 'Rukama napravi slovo T.' },
      { image: '/slike/kosarka/signals/substitution.jpg', caption: 'Izmena', verdict: null, info: 'Ruke prekrštene ispred grudi — igrač sa klupe može da uđe.' },
      { image: '/slike/kosarka/signals/cancel-score.jpg', caption: 'Koš ne važi', verdict: null, info: 'Ruke se ukrštaju i razdvajaju ispred tela, kao makaze.' },
    ],
    question: { text: 'Sudija podigne stisnutu pesnicu. Šta je dosudio?', answer: 'Faul.' },
  },
  {
    id: 'fair-play',
    title: 'Fer-plej',
    image: '/slike/kosarka/photos/handshake.jpg',
    frames: [
      { image: '/slike/kosarka/photos/handshake.jpg', caption: 'Pozdravi protivnika', verdict: 'ok', info: 'Pozdravi protivnika i sudije pre i posle utakmice.' },
      { picture: 'help-up', caption: 'Pomozi da ustane', verdict: 'ok', info: 'Kad protivnik padne, pomozi mu da ustane.' },
      { picture: 'respect-ref', caption: 'Kapiten priča mirno', verdict: 'ok', info: 'Odluke sudije se ne raspravljaju. Sa sudijom mirno razgovaraju samo kapiten i trener.' },
      { image: '/slike/kosarka/photos/bench-cheer.jpg', caption: 'Bodri, ne vređaj', verdict: 'ok', info: 'Igrači, roditelji i navijači: bodrite sve — deca uče od vas.' },
    ],
    question: { text: 'Ko sme da razgovara sa sudijom tokom utakmice?', answer: 'Kapiten (mirno) i trener.' },
  },
];

export const PHOTO_CREDITS_NOTE = 'Sudijski znaci: FIBA / PlayPic®, iz Službenih pravila igre 2022 (prevod KSS). Fotografije: Flickr i Wikimedia Commons, pod navedenim licencama.';

export const QUIZ: QuizQuestion[] = [
  { text: 'Koliko igrača jedne ekipe je na terenu?', options: ['4', '5', '6'], correct: 1, explanation: 'Po 5 igrača svake ekipe.' },
  { text: 'Koliko vredi koš iza luka?', options: ['2 poena', '3 poena', '4 poena'], correct: 1, explanation: 'Iza luka — 3 poena (noge ne smeju biti na liniji).' },
  { text: 'Šta je ovo?', picture: 'dribble-two-hands', options: ['Dozvoljeno', 'Dupla lopta', 'Koraci'], correct: 1, explanation: 'Vođenje obema rukama je dupla lopta.' },
  { text: 'Lopta je na liniji. Šta je to?', picture: 'ball-on-line', options: ['Aut', 'U igri', 'Sudijsko bacanje'], correct: 0, explanation: 'Linija nije deo terena — aut.' },
  { text: 'Koliko sekundi ima napad?', options: ['14', '24', '30'], correct: 1, explanation: '24 sekunde (14 posle skoka u napadu).' },
  { text: 'Koliko dugo napadač sme da stoji u reketu?', options: ['3 sekunde', '5 sekundi', 'Koliko hoće'], correct: 0, explanation: 'Najviše 3 sekunde.' },
  { text: 'Posle koliko faulova igrač ide na klupu?', options: ['4', '5', '6'], correct: 1, explanation: 'Sa 5 faulova do kraja utakmice.' },
  { text: 'Šta pokazuje sudija?', image: '/slike/kosarka/signals/foul.jpg', options: ['Tajm-aut', 'Faul', 'Izmenu'], correct: 1, explanation: 'Pesnica uvis je faul.' },
  { text: 'Šta pokazuje sudija?', image: '/slike/kosarka/signals/timeout.jpg', options: ['Tajm-aut', 'Koraci', 'Koš ne važi'], correct: 0, explanation: 'Slovo T je tajm-aut.' },
  { text: 'Dvojica drže loptu. Ko je dobija?', image: '/slike/kosarka/photos/jump-ball.jpg', options: ['Jači', 'Ekipa na koju pokazuje strelica', 'Sudija baca uvis'], correct: 1, explanation: 'Strelica naizmeničnog poseda odlučuje.' },
];

const KSS = 'https://lige.kss.rs/wp-content/uploads/';

export const RULE_DOCUMENT_GROUPS: RuleDocumentGroup[] = [
  {
    title: 'Zvanična pravila igre',
    description: 'Važeći srpski prevod koji objavljuje Košarkaški savez Srbije je izdanje 2022. Novija izdanja (sa izmenama) FIBA objavljuje na engleskom.',
    documents: [
      { title: 'FIBA Službena pravila igre 2022', note: 'prevod KSS', url: `${KSS}2024/02/FIBA-Sluzbena-pravila-igre-2022.pdf`, language: 'sr', format: 'PDF' },
      { title: 'FIBA Official Basketball Rules — aktuelno izdanje sa izmenama', note: 'zvanična stranica FIBA (pravila, izmene, tumačenja)', url: 'https://about.fiba.basketball/en/our-sport/official-basketball-rules', language: 'en', format: 'sajt' },
    ],
  },
  {
    title: 'Tumačenja pravila',
    description: 'Službena tumačenja objašnjavaju sporne situacije na primerima „situacija → odluka".',
    documents: [
      { title: 'FIBA Tumačenja pravila igre 2022 (jun 2023)', note: 'Official Interpretations', url: `${KSS}2024/02/FIBAOfficialInterpretations_v3_0a_yellow.pdf`, language: 'en', format: 'PDF' },
      { title: 'FIBA Priručnik za pomoćne sudije 2022', note: 'Table Officials Manual', url: `${KSS}2024/02/FIBA_Table_Officials_Manual_v4_2_2021_EN-1.pdf`, language: 'en', format: 'PDF' },
    ],
  },
  {
    title: 'Posebna pravila KSS za mlađe kategorije',
    description: 'Izmene pravila koje važe u takmičenjima mlađih kategorija (trajanje, obavezno igranje, zabrana zone...).',
    documents: [
      { title: 'Posebna pravila U11/U10 — minibasket', note: 'mini-košarka', url: `${KSS}2024/02/07-POSEBNA-Pravila-U11U10-MINIBASKET.pdf`, language: 'sr', format: 'PDF' },
      { title: 'Posebna pravila U13/U12 — mlađi pioniri', note: '', url: `${KSS}2024/10/074-POSEBNA-Pravila-U13U12-MLADJI-PIONIRI.pdf`, language: 'sr', format: 'PDF' },
      { title: 'Posebna pravila U13/U12 — mlađe pionirke', note: '', url: `${KSS}2024/10/05-POSEBNA-Pravila-U13U12-MLADJE-PIONIRKE.pdf`, language: 'sr', format: 'PDF' },
      { title: 'Posebna pravila U13/U12', note: '', url: `${KSS}2024/10/06-POSEBNA-Pravila-U13U12.pdf`, language: 'sr', format: 'PDF' },
      { title: 'Posebna pravila U15/U14 — pioniri', note: '', url: `${KSS}2024/02/072-POSEBNA-Pravila-U15U14-PIONIRI.pdf`, language: 'sr', format: 'PDF' },
    ],
  },
  {
    title: 'Basket 3×3',
    description: 'Pravila igre tri na tri na jedan koš.',
    documents: [
      { title: 'FIBA 3×3 Pravila igre 2019', note: '', url: `${KSS}2024/02/FIBA-3x3_Pravila-igre_2019_tekst.pdf`, language: 'sr', format: 'PDF' },
      { title: 'FIBA 3×3 Tumačenja pravila igre 2019', note: '', url: `${KSS}2024/02/FIBA-3x3_Pravila-igre_2019_Tumacenja.pdf`, language: 'sr', format: 'PDF' },
    ],
  },
];

export const RULE_SOURCE_URL = 'https://lige.kss.rs/dokumenta/pravila-igre/';
