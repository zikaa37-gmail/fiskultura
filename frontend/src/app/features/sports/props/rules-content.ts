export type PropsPicture =
  | 'rope-length'
  | 'rope-grip'
  | 'rope-tangle'
  | 'rope-single'
  | 'rope-series'
  | 'rope-run'
  | 'rope-heels'
  | 'rope-space'
  | 'rope-circle'
  | 'rope-twist'
  | 'rope-side-hops'
  | 'rope-loose'
  | 'hoop-grip'
  | 'hoop-swing'
  | 'hoop-roll'
  | 'hoop-hip'
  | 'hoop-wobble'
  | 'hoop-through'
  | 'hoop-hops'
  | 'hoop-pass'
  | 'hoop-floor-hit'
  | 'hoop-space'
  | 'ball-palm'
  | 'ball-squeeze'
  | 'ball-catch'
  | 'ball-bounce'
  | 'ball-toss'
  | 'ball-side-bend'
  | 'ball-roll-around'
  | 'ball-hop'
  | 'ball-deep-squat'
  | 'med-weight'
  | 'med-squat-press'
  | 'med-throw'
  | 'med-round-back'
  | 'med-signal'
  | 'cone-hold'
  | 'cone-reach'
  | 'cone-slalom'
  | 'cone-knock'
  | 'bench-walk'
  | 'bench-turn'
  | 'bench-mats'
  | 'bench-eyes-closed'
  | 'bench-support'
  | 'bench-bent-arms'
  | 'bench-pushup';

export type RuleVerdict = 'ok' | 'bad' | null;

export type RuleFocus = [number, number, number];

export interface RuleFrame {
  picture?: PropsPicture;
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
  picture?: PropsPicture;
  image?: string;
  frames: RuleFrame[];
  question: { text: string; answer: string };
}

export interface QuizQuestion {
  text: string;
  picture?: PropsPicture;
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
    id: 'rope-basics',
    title: 'Vijača — dužina i hvat',
    picture: 'rope-length',
    frames: [
      { picture: 'rope-length', caption: 'Krajevi do pazuha', verdict: null, info: 'Stani sredinom stopala na sredinu vijače, uhvati krajeve i zategni ih. Ako krajevi dođu do pazuha, vijača je prave dužine.' },
      { picture: 'rope-grip', caption: 'Otvorena i presavijena', verdict: null, info: 'Za preskakanje vijaču držiš obema rukama za krajeve. Za vežbe oblikovanja presaviješ je na četiri i držiš zategnutu u obe ruke.' },
      { picture: 'rope-tangle', caption: 'Kači se za stopala', verdict: 'bad', info: 'Ako se vijača kači za stopala ili udara o pod, verovatno je prekratka ili predugačka — ili kasniš sa skokom. Ponovo izmeri dužinu i skoči kad vijača dodirne pod.' },
      { picture: 'rope-space', caption: 'Bar 3 m razmaka', verdict: 'ok', info: 'Kad svi skaču, između dece treba da bude najmanje 3 metra, da vijača nikoga ne udari. Skače se na podu sale ili na ravnoj podlozi, ne na betonu u tankoj obući.' },
    ],
    question: { text: 'Kako znaš da je vijača prave dužine?', answer: 'Staneš na njenu sredinu — krajevi treba da dođu do pazuha.' },
  },
  {
    id: 'rope-jump',
    title: 'Preskakanje vijače',
    picture: 'rope-series',
    frames: [
      { picture: 'rope-single', caption: 'Jedan preskok', verdict: 'ok', info: 'Vijača je iza tela. Zamahni kroz uzručenje napred i, kad vijača dođe pred stopala, preskoči je sunožno i stani. Ponovi 5–8 puta.' },
      { picture: 'rope-series', caption: 'Sa prstiju, tiho', verdict: 'ok', info: 'U seriji: jedan okret vijače — jedan poskok. Vijača se okreće iz ručnih zglobova, laktovi su uz telo. Odraz je nizak i brz, sa prednjeg dela stopala, a doskok tih i mek.' },
      { picture: 'rope-run', caption: 'Trčeći korak', verdict: 'ok', info: 'Kad sunožni skokovi idu lako, preskači naizmenično levom i desnom nogom, prvo u mestu, a onda trčeći napred 10–15 m.' },
      { picture: 'rope-heels', caption: 'Glasno, na pete', verdict: 'bad', info: 'Glasan doskok na pete je greška. Skači sa prstiju, tiho, i nisko — samo toliko da vijača prođe.' },
    ],
    question: { text: 'Odakle se okreće vijača dok skačeš u seriji?', answer: 'Iz ručnih zglobova, ne iz ramena.' },
  },
  {
    id: 'rope-shape',
    title: 'Vežbe oblikovanja sa vijačom',
    picture: 'rope-circle',
    frames: [
      { picture: 'rope-circle', caption: 'Kruženje zategnutom vijačom', verdict: 'ok', info: 'Raskoračni stav, vijača presavijena na četiri, zategnuta u obe ruke. Kružiš vijačom ispred sebe — razgibavaju se ramena i bočni mišići trupa. Svaka vežba 8–10 puta.' },
      { picture: 'rope-twist', caption: 'Zasuci', verdict: 'ok', info: 'Vijača je ispred tebe u ispruženim rukama (predručenje). Okrećeš trup levo i desno — rade kosi trbušni mišići.' },
      { picture: 'rope-side-hops', caption: 'Bočni poskoci', verdict: 'ok', info: 'Vijača leži na podu. Sunožno poskakuješ preko nje levo–desno, 2 puta po 15–20 sekundi. Kome je teško, ubaci mali međuposkok.' },
      { picture: 'rope-loose', caption: 'Labava vijača', verdict: 'bad', info: 'Ako vijača visi labavo dok kružiš, vežba ne radi svoj posao. Drži je stalno zategnutu.' },
    ],
    question: { text: 'Kako držiš vijaču u vežbama oblikovanja?', answer: 'Presavijenu na četiri, zategnutu u obe ruke.' },
  },
  {
    id: 'hoop-basics',
    title: 'Obruč — hvat i osnovni pokreti',
    picture: 'hoop-roll',
    frames: [
      { picture: 'hoop-grip', caption: 'Prsti drže, palac vodi', verdict: null, info: 'Obruč držiš jednom rukom, odozgo (nathvat). Obruč se drži prstima, a palac vodi i kontroliše zamah. Obruč je kao produžetak ruke.' },
      { picture: 'hoop-swing', caption: 'Njihanje pored tela', verdict: 'ok', info: 'Njišeš obruč napred–nazad pored tela. Pokret kreće iz ramena i ručnog zgloba, a telo ga prati blagim polučučnjem. Probaj levom i desnom rukom, 4–8 puta.' },
      { picture: 'hoop-roll', caption: 'Kotrljanje po podu', verdict: 'ok', info: 'Obruč stoji uspravno, ruka je odozgo na obodu. Gurni ga napred rukom i podlakticom, trči pored i uhvati ga. U paru se kotrlja partneru na 5–6 m.' },
      { picture: 'hoop-hip', caption: 'Kruženje oko kukova', verdict: 'ok', info: 'Raskoračni stav. Pokreneš obruč rukama, a onda ga održavaš pokretom kukova napred–nazad.' },
      { picture: 'hoop-wobble', caption: 'Obruč krivuda', verdict: 'bad', info: 'Ako obruč krivuda i podrhtava dok se kotrlja, nije bio uspravan ili guranje nije bilo ravnomerno. Obruč uspravno, ruka odozgo, mirno gurni.' },
    ],
    question: { text: 'Šta treba da uradiš da bi obruč išao pravo?', answer: 'Da ga postaviš uspravno, ruka odozgo, i gurneš ravnomerno.' },
  },
  {
    id: 'hoop-play',
    title: 'Obruč u vežbama i igri',
    picture: 'hoop-through',
    frames: [
      { picture: 'hoop-through', caption: 'Prolazak kroz obruč', verdict: 'ok', info: 'Obruč držiš uspravno ispred sebe, zakoračiš kroz njega i prevučeš ga preko glave. Kasnije ga možeš preskakati kao vijaču.' },
      { picture: 'hoop-hops', caption: 'Poskoci oko obruča', verdict: 'ok', info: 'Obruč je na podu. Poskakuješ na jednoj nozi oko oboda, pa na drugoj — po 2 kruga. Pazi da ne staneš na obruč. Lakše: sunožno.' },
      { picture: 'hoop-pass', caption: 'Igra „Pošalji obruč"', verdict: 'ok', info: 'Svi se drže za ruke. Obruč „putuje" s jednog na drugog — provlačiš se kroz njega bez puštanja ruku. Polako, pazi na glavu i naočare.' },
      { picture: 'hoop-floor-hit', caption: 'Udara o pod', verdict: 'bad', info: 'Pri otklonima obruč ne sme da udari o pod — to je česta greška. Pazi i da ne spuštaš glavu u zaklonu.' },
      { picture: 'hoop-space', caption: 'Dovoljno mesta', verdict: 'ok', info: 'Obruč u uzručenju traži razmak oko 2 m između dece, a ritmičke vežbe sa obručem najmanje 3 m. Kotrljaj ga samo ka partneru i samo kad je prostor slobodan.' },
    ],
    question: { text: 'U igri „Pošalji obruč" — smeš li da pustiš ruke?', answer: 'Ne, ruke se ne puštaju ni u jednom trenutku.' },
  },
  {
    id: 'ball-rhythm',
    title: 'Lopta u ritmici',
    picture: 'ball-palm',
    frames: [
      { picture: 'ball-palm', caption: 'Lopta leži na dlanu', verdict: 'ok', info: 'Lopta leži na dlanu, prsti su opušteni. Prvo je držiš između dlanova, pa na jednom dlanu ispred sebe, sa strane i iznad glave.' },
      { picture: 'ball-squeeze', caption: 'Steže prstima', verdict: 'bad', info: 'Lopta se ne steže i ne drži prstima. Zapamti: „lopta leži na dlanu".' },
      { picture: 'ball-catch', caption: 'Tiho hvatanje', verdict: 'ok', info: 'Malo izbaci loptu i uhvati je tiho: ruka ide ka lopti i savija se zajedno sa njom. Prvo istom, pa drugom rukom.' },
      { picture: 'ball-bounce', caption: 'Guraj, ne udaraj', verdict: 'ok', info: 'Kod odbijanja o pod loptu guraš ka podu, ne udaraš je. Serija malih odbijanja ispod kolena, pa jedno visoko — prvo jačom, pa slabijom rukom.' },
      { picture: 'ball-toss', caption: 'Samo iznad sebe', verdict: 'ok', info: 'Loptu izbacuješ samo uvis iznad sebe, nikad ka drugima. Između dece treba bar 3 m.' },
    ],
    question: { text: 'Kako se lopta hvata tiho?', answer: 'Ruka ide ka lopti i savija se zajedno sa njom.' },
  },
  {
    id: 'ball-shape',
    title: 'Vežbe oblikovanja sa loptom',
    picture: 'ball-roll-around',
    frames: [
      { picture: 'ball-side-bend', caption: 'Otkloni sa loptom', verdict: 'ok', info: 'Raskoračni stav, lopta iznad glave u ispruženim rukama. Naginješ se u stranu sa malim zibom, pa u drugu. Svaka vežba 8–10 puta.' },
      { picture: 'ball-roll-around', caption: 'Kotrljanje oko sebe', verdict: 'ok', info: 'Sediš u turskom sedu i, saginjući se napred, kotrljaš loptu oko sebe s jedne na drugu stranu.' },
      { picture: 'ball-hop', caption: 'Bočni preskoci lopte', verdict: 'ok', info: 'Lopta je na podu, ruke na bokovima. Sunožno preskačeš loptu levo–desno. Lakše: samo prekoračuj loptu.' },
      { picture: 'ball-deep-squat', caption: 'Preduboki čučanj', verdict: 'bad', info: 'Čučanj sa loptom radi se samo do 90° — butine paralelno sa podom — pa usprav. Duboki čučanj zameni čučnjem do 90° ili iskorakom. I pretklon do seda ide polako, savijenih kolena, bez trzaja.' },
    ],
    question: { text: 'Do koje dubine se radi čučanj sa loptom?', answer: 'Do 90° — butine paralelno sa podom.' },
  },
  {
    id: 'medball',
    title: 'Medicinka',
    picture: 'med-throw',
    frames: [
      { picture: 'med-weight', caption: 'Lagana za decu', verdict: null, info: 'Medicinka je teška lopta. Za vežbe snage koristi se medicinka od 1–2 kg, a za bacanja u 5–7. razredu do 1 kg. Za mlađe — lakša lopta i manje ponavljanja.' },
      { picture: 'med-squat-press', caption: 'Čučanj i potisak', verdict: 'ok', info: 'Medicinka je na grudima. Čučneš do paralele (butine vodoravno), ustaneš i podigneš medicinku iznad glave. 10 puta, polako i kontrolisano.' },
      { picture: 'med-throw', caption: 'Bacanje iznad glave u paru', verdict: 'ok', info: 'Parovi stoje na 4–6 m. Medicinku do 1 kg bacaš obema rukama iznad glave partneru. Hvataš je savijenim rukama, ne ispruženim.' },
      { picture: 'med-round-back', caption: 'Okrugla leđa', verdict: 'bad', info: 'Kad podižeš medicinku, leđa su prava. Okrugla leđa i zamah umesto mirnog pokreta su česte greške.' },
      { picture: 'med-signal', caption: 'Baca se samo na znak', verdict: 'ok', info: 'Medicinka se baca samo na znak nastavnika, a svi parovi su okrenuti u istom pravcu. Niko ne stoji ispred onih koji bacaju.' },
    ],
    question: { text: 'Kada smeš da baciš medicinku?', answer: 'Samo na znak nastavnika, kad su svi parovi okrenuti u istom pravcu.' },
  },
  {
    id: 'cones',
    title: 'Čunjevi',
    picture: 'cone-slalom',
    frames: [
      { picture: 'cone-hold', caption: 'Mali čunj u svakoj ruci', verdict: null, info: 'Mali plastični čunjevi služe i kao lagani teg: držiš po jedan u svakoj ruci i radiš uzručenja, otklone i zasuke. Laktovi ostaju ispruženi. Svaka vežba 8–10 puta.' },
      { picture: 'cone-reach', caption: 'Čunj ispod noge', verdict: 'ok', info: 'Sediš, podigneš jednu ispruženu nogu i ispod nje preneseš čunj iz ruke u ruku. Pa drugom nogom.' },
      { picture: 'cone-slalom', caption: 'Slalom štafeta', verdict: 'ok', info: 'Čunjevi stoje u nizu na 2 m. Trčiš slalomom između njih sa loptom u rukama i predaješ je saigraču dodirom. Stariji vode loptu rukom ili nogom.' },
      { picture: 'cone-knock', caption: 'Oborio ili preskočio čunj', verdict: 'bad', info: 'Obaranje ili preskakanje čunja i bacanje lopte umesto predaje su greške. Kolone su bar 3 m jedna od druge, da se niko ne sudari.' },
    ],
    question: { text: 'Šta je greška u štafeti slalomom?', answer: 'Oboriti ili preskočiti čunj i baciti loptu umesto da je predaš.' },
  },
  {
    id: 'bench-balance',
    title: 'Švedska klupa — ravnoteža',
    picture: 'bench-walk',
    frames: [
      { picture: 'bench-walk', caption: 'Hod po klupi', verdict: 'ok', info: 'Hodaš po klupi napred, nazad i bočno, pa u usponu na prstima. Prvo po široj strani, a kad ide lako — po uskoj strani obrnute klupe. Svaki zadatak 2–3 prelaza.' },
      { picture: 'bench-turn', caption: 'Okret na sredini', verdict: 'ok', info: 'Kad hod ide sigurno, na sredini klupe se okreneš za pola kruga (180°) i nastaviš. Teže: noseći loptu ili vreću na glavi.' },
      { picture: 'bench-mats', caption: 'Strunjače pored klupe', verdict: 'ok', info: 'Pored klupe stoje strunjače. Sledeći kreće tek kad prethodni pređe polovinu klupe.' },
      { picture: 'bench-eyes-closed', caption: 'Zatvorenih očiju — ne', verdict: 'bad', info: 'Sa mlađom decom vežbe ravnoteže se ne rade zatvorenih očiju, jer je lako pasti. Greške su i gledanje u stopala, ukočeno telo i prebrz hod.' },
    ],
    question: { text: 'Smeš li po klupi da hodaš zatvorenih očiju?', answer: 'Ne — vežbe ravnoteže radimo otvorenih očiju.' },
  },
  {
    id: 'bench-strength',
    title: 'Švedska klupa — upori i sklekovi',
    picture: 'bench-support',
    frames: [
      { picture: 'bench-support', caption: 'Upor između dve klupe', verdict: 'ok', info: 'Staneš između dve klupe, osloniš se šakama na sredinu sedišta i odigneš stopala. Ruke su opružene, ramena spuštena, telo pravo. Izdržaj 3–5 sekundi, 3 puta.' },
      { picture: 'bench-bent-arms', caption: 'Savijeni laktovi', verdict: 'bad', info: 'Savijeni laktovi, podignuta ramena („glava u ramenima") i savijanje u kukovima su česte greške. Lakše: stopala ostaju na podu, samo opružiš ruke.' },
      { picture: 'bench-pushup', caption: 'Sklek sa rukama na klupi', verdict: 'ok', info: 'Sklek je lakši kad su ruke na klupi. Teže je kad su noge na klupi, a ruke na podu.' },
    ],
    question: { text: 'Kakve su ruke u uporu na klupama?', answer: 'Opružene, a ramena spuštena.' },
  },
];

export const QUIZ: QuizQuestion[] = [
  { text: 'Staneš na sredinu vijače. Dokle treba da dođu krajevi?', picture: 'rope-length', options: ['Do kolena', 'Do pazuha', 'Iznad glave'], correct: 1, explanation: 'Krajevi zategnute vijače treba da dođu do pazuha.' },
  { text: 'Kako se doskače posle preskoka vijače?', options: ['Glasno, na pete', 'Tiho, na prste', 'Na celo stopalo, što jače'], correct: 1, explanation: 'Odraz i doskok su sa prednjeg dela stopala — tiho i meko.' },
  { text: 'Koliko razmaka treba između dece koja skaču vijaču?', options: ['Pola metra', 'Najmanje 3 m', 'Nije važno'], correct: 1, explanation: 'Najmanje 3 m, da vijača nikoga ne udari.' },
  { text: 'Šta nije u redu na slici?', picture: 'rope-loose', options: ['Vijača je labava', 'Ruke su gore', 'Sve je u redu'], correct: 0, explanation: 'U vežbama oblikovanja vijača je stalno zategnuta.' },
  { text: 'Kako obruč ide pravo kad ga kotrljaš?', picture: 'hoop-roll', options: ['Kad ga baciš što jače', 'Uspravno, ruka odozgo, ravnomerno guranje', 'Kad je položen na pod'], correct: 1, explanation: 'Obruč uspravno, ruka odozgo na obodu, ravnomeran impuls.' },
  { text: 'Kako lopta stoji na ruci u ritmici?', options: ['Stegnuta prstima', 'Leži na dlanu', 'Na vrhu jednog prsta'], correct: 1, explanation: 'Lopta leži na dlanu — ne steže se prstima.' },
  { text: 'Kuda izbacuješ loptu u ritmičkim vežbama?', picture: 'ball-toss', options: ['Ka drugaru', 'Samo uvis iznad sebe', 'Što dalje'], correct: 1, explanation: 'Samo uvis iznad sebe, nikad ka drugima.' },
  { text: 'Kada smeš da baciš medicinku partneru?', picture: 'med-signal', options: ['Kad god hoćeš', 'Samo na znak nastavnika', 'Kad partner gleda na drugu stranu'], correct: 1, explanation: 'Medicinka se baca samo na znak, a parovi su okrenuti u istom pravcu.' },
  { text: 'Šta je greška na slici?', picture: 'med-round-back', options: ['Okrugla leđa', 'Lopta je preteška', 'Ništa'], correct: 0, explanation: 'Leđa su prava kad se podiže medicinka.' },
  { text: 'Šta stoji pored švedske klupe dok vežbamo ravnotežu?', picture: 'bench-mats', options: ['Čunjevi', 'Strunjače', 'Ništa'], correct: 1, explanation: 'Strunjače pored klupe štite ako neko izgubi ravnotežu.' },
];

export const RULE_DOCUMENT_GROUPS: RuleDocumentGroup[] = [
  {
    title: 'Vežbe oblikovanja i pripremni deo časa',
    description: 'Kompleksi vežbi oblikovanja sa vijačom, obručem, loptom, čunjevima i medicinkom, sa doziranjem i čestim greškama.',
    documents: [
      { title: 'Pripremna faza časa fizičkog vaspitanja', note: 'FSFV Niš, Metodika fizičkog vaspitanja (kompleksi sa rekvizitima)', url: 'https://fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/1-PRIPREMNA-FAZA-CASA-FIZICKOG-VASPITANJA.pdf', language: 'sr', format: 'PDF' },
      { title: 'Vežbe — prvi deo: čas fizičkog vaspitanja', note: 'FSFV Niš (uvodni deo časa, štafete, lakši poligoni)', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/Vezbe-prvi-deo.pdf', language: 'sr', format: 'PDF' },
      { title: 'Trening snage i mišićne izdržljivosti', note: 'FSFV Niš, nastavni materijal (kružni trening sa rekvizitima)', url: 'https://fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/Osnove_razvoja_snage_u_fizickom_vaspitanju.pdf', language: 'sr', format: 'PDF' },
    ],
  },
  {
    title: 'Ritmika i gimnastika',
    description: 'Hvatovi i metodski nizovi za vijaču, obruč i loptu iz ritmičke gimnastike, i vežbe na švedskoj klupi.',
    documents: [
      { title: 'Ritmička gimnastika — tekst predavanja (vijača, lopta, obruč)', note: 'FSFV Niš, predmet Ritmička gimnastika', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/treca_godina/ritmicka_gimnastika/Ritmicka-gimnastika-VIII-IX-X-i-XI-nedelja-Tekst-predavanja.pdf', language: 'sr', format: 'PDF' },
      { title: 'Sportska gimnastika II — metodika', note: 'Veličković, Petković, Ilić, FSFV Niš 2013 (upori na klupama)', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/treca_godina/gimnastika/skolsk/SPORTSKA_GIMNASTIKA_II.pdf', language: 'sr', format: 'PDF' },
      { title: 'Razvoj motoričkih sposobnosti kod dece', note: 'FSFV Niš, Dečji sport (ravnoteža, medicinka kod mlađih)', url: 'https://fsfv.ni.ac.rs/files/documents/oas/treca_godina/deciji_sport/skolska_20_21/DS_Razvoj_mot_sposobnosti.pdf', language: 'sr', format: 'PDF' },
    ],
  },
  {
    title: 'Programi i igre',
    description: 'Program nastave i učenja i priručnici sa igrama u kojima se koriste rekviziti.',
    documents: [
      { title: 'Program nastave i učenja za VI razred — Fizičko i zdravstveno vaspitanje', note: 'Ministarstvo prosvete RS, kopija na sajtu FSFV Niš', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/VI_razred.pdf', language: 'sr', format: 'PDF' },
      { title: 'Igre za svakoga', note: 'Dražen Mihajlović, Sport za razvoj, 2020 (igra „Pošalji obruč")', url: 'https://www.sport-for-development.com/imglib/downloads/Manuale/Western%20Balkan/mihajlovi%C4%87-giz-2020-bcms-manual-igre-za-scakoga.pdf', language: 'sr', format: 'PDF' },
      { title: 'Mjerila ocjenjivanja TZK, V–VIII razred', note: 'OŠ Izidora Kršnjavoga, Zagreb (bacanje medicinke)', url: 'https://web-arhiva.skole.hr/os-ikrsnjavi-zg/upload/os-ikrsnjavi-zg/images/newsimg/535/File/TZK.pdf', language: 'sr', format: 'PDF' },
    ],
  },
];

export const RULE_SOURCE_URL = 'https://fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/1-PRIPREMNA-FAZA-CASA-FIZICKOG-VASPITANJA.pdf';
