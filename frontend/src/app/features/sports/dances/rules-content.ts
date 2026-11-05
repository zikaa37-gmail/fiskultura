export type DancesPicture =
  | 'beat-24'
  | 'beat-34'
  | 'tempo-change'
  | 'clap-echo'
  | 'kolo-open'
  | 'kolo-closed'
  | 'hold-v'
  | 'hold-t'
  | 'origin-unesco'
  | 'step-walk'
  | 'step-close'
  | 'step-cross'
  | 'step-hop'
  | 'trokorak'
  | 'trokorak-left'
  | 'semicircle'
  | 'origin-moravac'
  | 'moravac-seven'
  | 'moravac-threes'
  | 'moravac-left'
  | 'var-hajde'
  | 'var-cujes'
  | 'var-cetiri'
  | 'var-tri-skoka'
  | 'origin-uzicko'
  | 'uzicko-run'
  | 'waltz-count'
  | 'waltz-stomp'
  | 'origin-waltz'
  | 'waltz-hold'
  | 'waltz-box'
  | 'waltz-square'
  | 'origin-viennese'
  | 'viennese-tempo'
  | 'viennese-turn'
  | 'origin-rock'
  | 'rock-rhythm'
  | 'rock-hold'
  | 'rock-step'
  | 'rock-turn'
  | 'rope-length'
  | 'rope-jump'
  | 'rope-run';

export type RuleVerdict = 'ok' | 'bad' | null;

export type RuleFocus = [number, number, number];

export interface RuleFrame {
  picture?: DancesPicture;
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
  picture?: DancesPicture;
  image?: string;
  frames: RuleFrame[];
  question: { text: string; answer: string };
}

export interface QuizQuestion {
  text: string;
  picture?: DancesPicture;
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
  format: 'PDF' | 'sajt' | 'video';
}

export interface RuleDocumentGroup {
  title: string;
  description: string;
  documents: RuleDocument[];
}

export const RULE_CARDS: RuleCard[] = [
  {
    id: 'rhythm',
    title: 'Takt i ritam',
    picture: 'beat-24',
    frames: [
      { picture: 'beat-24', caption: '2/4 — „jedan–dva”', verdict: null, info: 'Narodna kola igraju se u taktu 2/4: u svakom taktu su dve dobe i brojimo „jedan–dva”. Prva doba je naglašena — na „jedan” pljesnemo jače.' },
      { picture: 'beat-34', caption: '3/4 — „jedan–dva–tri”', verdict: null, info: 'Valcer je u taktu 3/4: tri dobe u taktu, brojimo „jedan–dva–tri”, a naglašena je prva.' },
      { picture: 'tempo-change', caption: 'Hod, trčanje, sporo', verdict: null, info: 'Uz istu muziku menjamo tempo: hod — jedan korak na svaku dobu; lagano trčanje — dva koraka na jednu dobu; usporeni hod — jedan korak na dve dobe.' },
      { picture: 'clap-echo', caption: 'Pljesak — topot', verdict: 'ok', info: 'Igra u paru: jedan pljeskom zada ritam od dva takta, drugi ga ponovi topotom. Posle četiri zadatka menjate uloge.' },
    ],
    question: { text: 'Koliko doba ima jedan takt u 2/4?', answer: 'Dve — „jedan–dva”.' },
  },
  {
    id: 'kolo',
    title: 'Šta je kolo',
    picture: 'kolo-open',
    frames: [
      { picture: 'kolo-open', caption: 'Otvoreno kolo', verdict: null, info: 'Igrači su uhvaćeni u lanac. Na desnom kraju je kolovođa — on vodi kolo. Kolo kreće udesno, a slobodna ruka krajnjih igrača je na boku.' },
      { picture: 'kolo-closed', caption: 'Zatvoreno kolo — krug', verdict: null, info: 'Kad se krajevi lanca uhvate, nastaje krug. Kretanje udesno je suprotno kazaljci na satu — isto kao kad trčimo u koloni po obodu sale.' },
      { picture: 'hold-v', caption: 'Držanje „V”', verdict: 'ok', info: 'Najčešće držanje: ruke uhvaćene i spuštene uz telo, laktovi meki. Ruke su kao amortizeri — ne vučemo suseda.' },
      { picture: 'hold-t', caption: 'Držanje „T”', verdict: 'ok', info: 'Ruke na ramenima suseda. Ovako se kolo često igra kad igraju samo dečaci.' },
      { picture: 'origin-unesco', caption: 'UNESCO 2017', verdict: null, info: 'Kolo je 2017. upisano na UNESCO listu nematerijalnog kulturnog nasleđa čovečanstva. To je zajednički ples u kojem su igrači povezani u lanac.' },
    ],
    question: { text: 'Ko vodi kolo i gde stoji?', answer: 'Kolovođa, na desnom kraju.' },
  },
  {
    id: 'steps',
    title: 'Koraci za kolo',
    picture: 'step-cross',
    frames: [
      { picture: 'step-walk', caption: 'Običan korak', verdict: null, info: 'Naizmenično desna–leva: na „jedan” iskorak desnom i prenos težine, na „dva” levom. Telo je okrenuto u smeru kretanja.' },
      { picture: 'step-close', caption: 'Privlačeći korak', verdict: null, info: 'Desnom korak udesno („jedan”), leva se privuče uz desnu („dva”). Ulevo isto, ali počinje levom.' },
      { picture: 'step-cross', caption: 'Ukršteni korak', verdict: null, info: 'Desnom korak udesno, levom ukršteno ispred ili iza desne. Kad se ukršteni koraci nižu — ispred, pa iza — to je preplet.' },
      { picture: 'step-hop', caption: 'Poskok', verdict: null, info: 'Posle koraka odskočiš sa iste noge i doskočiš na nju, a druga noga je odignuta. Brojimo „pr-va”, „dru-ga”. Poskok je nizak i mekan.' },
    ],
    question: { text: 'Kad korak ukrštaš ispred pa iza, kako se to zove?', answer: 'Preplet.' },
  },
  {
    id: 'trokorak',
    title: 'Trokorak',
    picture: 'trokorak',
    frames: [
      { picture: 'trokorak', caption: '„ta – ti-ti”', verdict: null, info: 'Trokorak u mestu: „jedan” — desna u mestu, „dva” — leva pored desne, „i” — desna pored leve. Prvi korak je dug, druga dva brza.' },
      { picture: 'trokorak-left', caption: 'Pa počinje levom', verdict: null, info: 'Sledeći trokorak počinje drugom nogom: leva — desna — leva. Trokorak je kraj svake polovine kola „u šest”.' },
      { picture: 'semicircle', caption: 'Uči se u polukrugu', verdict: 'ok', info: 'Korake prvo učimo u polukrugu, bez držanja za ruke. Nastavnik stoji ispred, okrenut leđima, da svi idu na istu stranu. Prvo uz brojanje, pa uz muziku.' },
    ],
    question: { text: 'Koliko koraka ima trokorak?', answer: 'Tri: „jedan – dva – i”.' },
  },
  {
    id: 'moravac',
    title: 'Moravac',
    picture: 'moravac-seven',
    frames: [
      { picture: 'origin-moravac', caption: 'Kolo „u šest”, 2/4', verdict: null, info: 'Moravac je ime poznate melodije, a igra je kolo „u šest” — najpopularnija vrsta kola u Srbiji, iz Šumadije. Igra se u 2/4: 4 takta udesno i 4 takta ulevo, kao u ogledalu.' },
      { picture: 'moravac-seven', caption: 'Takt 1–2: sedam koraka', verdict: null, info: 'Udesno: desnom u stranu, levom ukršteno iza, desnom, levom iza, desnom, levom iza, desnom — sedam koraka, pa kratko stani.' },
      { picture: 'moravac-threes', caption: 'Takt 3–4: dva trokoraka', verdict: null, info: 'Licem ka centru dva trokoraka u mestu: prvi počinje levom, drugi desnom.' },
      { picture: 'moravac-left', caption: 'Takt 5–8: isto ulevo', verdict: null, info: 'Sve se ponavlja ulevo, počinje levom: levom u stranu, desnom ukršteno iza… pa dva trokoraka. Kolo uvek kreće desnom nogom udesno.' },
    ],
    question: { text: 'Kojom nogom i na koju stranu kreće Moravac?', answer: 'Desnom nogom, udesno.' },
  },
  {
    id: 'moravac-var',
    title: 'Moravac — varijante',
    picture: 'var-cujes',
    frames: [
      { picture: 'var-hajde', caption: '„Hajde”', verdict: null, info: 'Takt 1: desnom napred udesno, levom ukršteno ispred. Takt 2: licem ka centru desnom u stranu i dodir petom leve. Takt 3: isto na levu stranu. Takt 4: kao takt 2.' },
      { picture: 'var-cujes', caption: '„Čuješ”', verdict: null, info: 'Takt 1: desnom udesno, nizak poskok na desnoj, levom ukršteno ispred. Takt 2–4: tri trokoraka u mestu.' },
      { picture: 'var-cetiri', caption: '„Četiri”', verdict: null, info: 'Takt 1: četiri koraka — desnom u stranu, levom iza, desnom u stranu, levom iza. Takt 2–4: tri trokoraka u mestu.' },
      { picture: 'var-tri-skoka', caption: '„Tri skoka”', verdict: null, info: 'Tri puta: desnom u stranu, nizak poskok na desnoj, levom ukršteno iza. Takt 4: trokorak u mestu.' },
    ],
    question: { text: 'Koliko traje svaka varijanta?', answer: '4 takta udesno i 4 takta ulevo — kao osnovni korak.' },
  },
  {
    id: 'uzicko',
    title: 'Užičko kolo',
    picture: 'uzicko-run',
    frames: [
      { picture: 'origin-uzicko', caption: 'Ime po Užicu', verdict: null, info: 'Užičko kolo ime je dobilo po gradu Užicu. Melodija je novija i brža od Moravca, a igra je živa i poskočna. Isti obrazac: udesno, pa ulevo, kao u ogledalu.' },
      { picture: 'uzicko-run', caption: 'Figura 1: lakim trčanjem', verdict: null, info: 'Osnovni korak je kao u Moravcu (sedam koraka i dva trokoraka), ali lakim trčećim korakom, na prednjem delu stopala.' },
      { picture: 'var-tri-skoka', caption: 'Figura 2: poskoci', verdict: null, info: 'Tri puta: desnom u stranu uz savijanje kolena, nizak poskok na desnoj, levom ukršteno iza. Pa trokorak u mestu. Ulevo isto, počinje levom.' },
      { picture: 'hold-t', caption: 'Ruke spuštene ili na ramenima', verdict: null, info: 'Igra se u otvorenom kolu, sa rukama spuštenim („V”) ili na ramenima suseda („T”). Užičko kolo se igra različito od kraja do kraja — ovo je školska varijanta.' },
    ],
    question: { text: 'Po čemu se Užičko kolo razlikuje od Moravca?', answer: 'Brže je i poskočno.' },
  },
  {
    id: 'waltz-rhythm',
    title: 'Ritam valcera',
    picture: 'waltz-count',
    frames: [
      { picture: 'beat-34', caption: '„prva–druga–treća”', verdict: null, info: 'Valcer je u taktu 3/4. Na svaki takt dolaze tri koraka, a brojimo „prva–druga–treća”.' },
      { picture: 'waltz-count', caption: 'Dug — kratak — kratak', verdict: null, info: 'Prvi korak je duži, na celom stopalu i sa naglaskom. Druga dva su kraća, na poluprstima.' },
      { picture: 'waltz-stomp', caption: 'Korak — topot — topot', verdict: null, info: 'Prva predvežba: korak desnom napred, leva se priključi uz topot, topot desnom u mestu. Pa isto unazad: levom nazad, topot desnom, topot levom.' },
    ],
    question: { text: 'Koji korak valcera je najduži?', answer: 'Prvi — na celom stopalu.' },
  },
  {
    id: 'english-waltz',
    title: 'Engleski valcer',
    picture: 'waltz-box',
    frames: [
      { picture: 'origin-waltz', caption: '3/4, 30–32 takta u minuti', verdict: null, info: 'Nastao je krajem 19. veka u Americi kao „Boston” valcer. Od 1932. zove se spori ili engleski valcer. Igra se polako: 30–32 takta u minuti.' },
      { picture: 'waltz-hold', caption: 'Klasično držanje', verdict: 'ok', info: 'Partner desnu ruku stavlja na lopaticu partnerke, a levom drži njenu desnu ruku u visini ramena. Partnerka levu ruku stavlja na njegovo desno rame. Telo uspravno.' },
      { picture: 'waltz-box', caption: 'Osnovni korak — partner', verdict: null, info: 'Desnom napred (1), levom nalevo na poluprstima (2), desnu priključi i spusti pete (3), levom napred (4), desnom nadesno (5), levu priključi (6). Partnerka sve isto, ali unazad.' },
      { picture: 'waltz-square', caption: '„Kvadrat”', verdict: null, info: 'Desnom napred, levom nalevo, desnu priključi, levom nazad, desnom nadesno, levu priključi — stopala opišu kvadrat i vrate se na isto mesto.' },
    ],
    question: { text: 'Kojom nogom partner počinje osnovni korak?', answer: 'Desnom, napred.' },
  },
  {
    id: 'viennese',
    title: 'Bečki valcer',
    picture: 'viennese-turn',
    frames: [
      { picture: 'origin-viennese', caption: 'Iz Austrije', verdict: null, info: 'Bečki valcer nastao je u Austriji u drugoj polovini 18. veka. U gimnaziji je osnova za maturski ples.' },
      { picture: 'viennese-tempo', caption: 'Skoro duplo brži', verdict: null, info: 'Bečki valcer igra se oko 58–60 takta u minuti, a engleski 30–32. Zato su koraci kraći.' },
      { picture: 'viennese-turn', caption: 'Desni okret', verdict: null, info: 'Ples se sastoji od okreta i promena. U desnom okretu na svaka tri koraka par se okrene za pola kruga, pa šest koraka daje ceo krug. Pogled je preko ramena partnera, ne u pod — tako se ne vrti u glavi.' },
      { picture: 'waltz-hold', caption: 'Držanje i promena', verdict: null, info: 'Igra se u klasičnom držanju, kao engleski valcer. Između okreta ide promena — tri koraka bez okreta: desnom napred, levom u stranu, desnu priključi. Koristi se kao predah i prelaz.' },
    ],
    question: { text: 'Koji valcer je brži — engleski ili bečki?', answer: 'Bečki, skoro duplo.' },
  },
  {
    id: 'rock',
    title: 'Rokenrol',
    picture: 'rock-turn',
    frames: [
      { picture: 'origin-rock', caption: '4/4, Severna Amerika', verdict: null, info: 'Rokenrol je nastao u Severnoj Americi sredinom 20. veka. Igra se u taktu 4/4, umereno brzo do brzo.' },
      { picture: 'rock-rhythm', caption: 'Sporo, sporo, brzo-brzo', verdict: null, info: 'Ritam je S S Q Q: dva spora koraka (po četvrtinu) i dva brza (po osminu). Probaj pljeskom: „spo-ro, spo-ro, brzo-brzo”.' },
      { picture: 'rock-hold', caption: 'Otvoreno držanje', verdict: 'ok', info: 'Partner i partnerka stoje licem u lice; partner levom rukom drži desnu ruku partnerke. Hvat je labav.' },
      { picture: 'rock-step', caption: 'Osnovni korak — partner', verdict: null, info: 'S: levom nalevo. S: desnom nadesno. Q: levom unazad, na poluprstima. Q: težina nazad na desnu. Partnerka isto, ali drugom nogom. Korak unazad je mali.' },
      { picture: 'rock-turn', caption: 'Okret ispod ruke', verdict: 'ok', info: 'Partner podigne ruku iznad glave partnerke, a ona se okrene nadesno ispod nje. Partner ne vuče ruku — partnerka se okreće sama.' },
    ],
    question: { text: 'Šta znači ritam S S Q Q?', answer: 'Sporo, sporo, brzo, brzo.' },
  },
  {
    id: 'rope',
    title: 'Vijača uz muziku',
    picture: 'rope-jump',
    frames: [
      { picture: 'rope-length', caption: 'Dužina — do pazuha', verdict: 'ok', info: 'Stani sredinom stopala na sredinu vijače i zategni krajeve nagore. Krajevi treba da dođu do pazuha.' },
      { picture: 'rope-jump', caption: 'Sunožni preskok', verdict: 'ok', info: 'Skače se sa prstiju, nisko i tiho, samo toliko da vijača prođe. Vijača se okreće iz ručnih zglobova, laktovi su uz telo. Uz muziku 2/4 — poskok na svaku dobu.' },
      { picture: 'rope-run', caption: 'Trčanje kroz vijaču', verdict: 'ok', info: 'Naizmenično levom i desnom nogom, kao trčeći korak — prvo u mestu, pa u kretanju napred.' },
    ],
    question: { text: 'Do kog dela tela treba da dođu krajevi vijače?', answer: 'Do pazuha.' },
  },
];

export const QUIZ: QuizQuestion[] = [
  { text: 'U kom taktu se igraju narodna kola?', options: ['2/4', '3/4', '4/4'], correct: 0, explanation: 'Kolo se igra u 2/4 — „jedan–dva”.' },
  { text: 'Koji takt ima valcer?', picture: 'beat-34', options: ['2/4', '3/4', '4/4'], correct: 1, explanation: 'Valcer je u 3/4 — „prva–druga–treća”.' },
  { text: 'Gde stoji kolovođa?', picture: 'kolo-open', options: ['Na levom kraju', 'U sredini', 'Na desnom kraju'], correct: 2, explanation: 'Kolovođa je na desnom kraju i vodi kolo.' },
  { text: 'Kako se zove ovo držanje?', picture: 'hold-v', options: ['„V” — ruke spuštene', '„T” — ruke na ramenima', 'Klasično držanje'], correct: 0, explanation: 'Ruke su uhvaćene i spuštene — držanje „V”.' },
  { text: 'Kada je kolo upisano na UNESCO listu?', options: ['1962.', '2017.', '2025.'], correct: 1, explanation: 'Kolo je na UNESCO listi nematerijalnog kulturnog nasleđa od 2017.' },
  { text: 'Koliko koraka ima prvi deo Moravca udesno?', picture: 'moravac-seven', options: ['Tri', 'Pet', 'Sedam'], correct: 2, explanation: 'Sedam koraka sa ukrštanjem iza, pa dva trokoraka.' },
  { text: 'Kako se broji trokorak?', picture: 'trokorak', options: ['„jedan – dva – i”', '„jedan – dva – tri – četiri”', '„jedan” i stani'], correct: 0, explanation: 'Trokorak: „jedan – dva – i”, ritam „ta – ti-ti”.' },
  { text: 'Koji ples je nastao kao „Boston” valcer?', options: ['Bečki valcer', 'Engleski valcer', 'Rokenrol'], correct: 1, explanation: 'Engleski valcer nastao je krajem 19. veka u Americi kao „Boston” valcer.' },
  { text: 'Kakav je ritam rokenrola?', picture: 'rock-rhythm', options: ['Sporo, sporo, brzo, brzo', 'Brzo, brzo, brzo', 'Jedan–dva–tri'], correct: 0, explanation: 'S S Q Q — dva spora i dva brza koraka.' },
  { text: 'Kako se okreće vijača?', picture: 'rope-jump', options: ['Iz ramena', 'Iz ručnih zglobova', 'Celim telom'], correct: 1, explanation: 'Laktovi uz telo, vijača se okreće iz ručnih zglobova.' },
];

export const RULE_DOCUMENT_GROUPS: RuleDocumentGroup[] = [
  {
    title: 'Narodna kola',
    description: 'Kolo je 2017. upisano na UNESCO listu nematerijalnog kulturnog nasleđa čovečanstva. Koraci Moravca i njegove varijante opisani su prema opisu kola „u šest” (Dick Crum / Dick Oakes) i metodici obučavanja narodnih igara.',
    documents: [
      { title: 'Kolo, traditional folk dance', note: 'UNESCO, Reprezentativna lista nematerijalnog kulturnog nasleđa', url: 'https://ich.unesco.org/en/RL/kolo-traditional-folk-dance-01270', language: 'en', format: 'sajt' },
      { title: 'Kolo, traditional folk dance — video', note: 'UNESCO, snimak Ansambla „Kolo” (2016)', url: 'https://www.youtube.com/watch?v=DcYnwb-hAK0', language: 'en', format: 'video' },
      { title: 'Ansambl narodnih pesama i igara „Kolo”', note: 'nacionalni ansambl, Beograd', url: 'https://kolo.rs/', language: 'sr', format: 'sajt' },
      { title: 'Metodika obučavanja narodnih igara', note: 'diplomski rad, Pedagoški fakultet u Jagodini (2012)', url: 'https://zelenaucionica.com/wp-content/uploads/2014/11/Metodika-obucavanja-narodnih-igara.pdf', language: 'sr', format: 'PDF' },
      { title: 'U šest koraka (Serbian)', note: 'opis kola „u šest” / Moravac sa varijantama, Dick Oakes prema Dick Crumu', url: 'https://socalfolkdance.org/syllabi/syllabus_instructor_oakes_2018/U_sest_koraka_Serbian.pdf', language: 'en', format: 'PDF' },
    ],
  },
  {
    title: 'Društveni plesovi',
    description: 'Engleski valcer, bečki valcer i rokenrol prema udžbeniku i predavanjima Fakulteta sporta i fizičkog vaspitanja Univerziteta u Nišu.',
    documents: [
      { title: 'Engleski valcer', note: 'prezentacija, predmet Društveni ples, FSFV Niš', url: 'https://fsfv.ni.ac.rs/files/documents/oas/druga_godina/drustveni_ples/skolska_20_21/7_Engleski_valcer.pdf', language: 'sr', format: 'PDF' },
      { title: 'Društveni ples', note: 'udžbenik, R. Kostić i S. Uzunović, FSFV Niš', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/druga_godina/drustveni_ples/25_26_skolska/Drustveni-ples-knjiga-za-sajt.pdf', language: 'sr', format: 'PDF' },
      { title: 'Viennese waltz', note: 'Wikipedia — poreklo i tempo bečkog valcera', url: 'https://en.wikipedia.org/wiki/Viennese_waltz', language: 'en', format: 'sajt' },
    ],
  },
  {
    title: 'Ritmika i program',
    description: 'Vežbe sa vijačom i ritmičke vežbe uz muziku, i program fizičkog i zdravstvenog vaspitanja za gimnaziju.',
    documents: [
      { title: 'Ritmička gimnastika — vežbe sa vijačom, loptom i obručem', note: 'tekst predavanja, FSFV Niš', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/treca_godina/ritmicka_gimnastika/Ritmicka-gimnastika-VIII-IX-X-i-XI-nedelja-Tekst-predavanja.pdf', language: 'sr', format: 'PDF' },
      { title: 'Program nastave i učenja za gimnaziju', note: 'Fizičko i zdravstveno vaspitanje I–IV, ZUOV', url: 'https://zuov.gov.rs/wp-content/uploads/2020/08/pravilnik-gimnazija.pdf', language: 'sr', format: 'PDF' },
    ],
  },
];

export const RULE_SOURCE_URL = 'https://ich.unesco.org/en/RL/kolo-traditional-folk-dance-01270';
