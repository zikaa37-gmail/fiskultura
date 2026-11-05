export type ElementaryGamesPicture =
  | 'pair-field'
  | 'pair-chase'
  | 'swap-roles'
  | 'push-bad'
  | 'walk-easy'
  | 'tag-zone'
  | 'freeze-stand'
  | 'freeze-crawl'
  | 'guard-bad'
  | 'touch-save'
  | 'chain-start'
  | 'chain-ends'
  | 'chain-under'
  | 'chain-break'
  | 'chain-split'
  | 'one-chaser'
  | 'help-hands'
  | 'count-three'
  | 'help-trio'
  | 'third-circle'
  | 'third-stop'
  | 'third-long'
  | 'hares-cross'
  | 'hares-close'
  | 'hares-hop'
  | 'ballsave-field'
  | 'ballsave-safe'
  | 'ballsave-pass'
  | 'ballsave-hold'
  | 'relay-setup'
  | 'relay-touch'
  | 'relay-early'
  | 'relay-right'
  | 'slalom-cones'
  | 'slalom-carry'
  | 'slalom-dribble'
  | 'slalom-skip'
  | 'lead-setup'
  | 'lead-grow'
  | 'lead-break'
  | 'colors-free'
  | 'colors-call'
  | 'colors-body'
  | 'first-setup'
  | 'first-call'
  | 'first-grab'
  | 'first-early'
  | 'son-circle'
  | 'son-call'
  | 'son-run'
  | 'son-easy'
  | 'touch-ok'
  | 'space-ok'
  | 'look-bad'
  | 'rules-teacher'
  | 'all-in'
  | 'fires-court'
  | 'fires-hit'
  | 'fires-catch'
  | 'fires-captain'
  | 'four-fires'
  | 'border-court'
  | 'border-hit'
  | 'border-save'
  | 'border-pass'
  | 'border-line';

export type RuleVerdict = 'ok' | 'bad' | null;

export type RuleFocus = [number, number, number];

export interface RuleFrame {
  picture?: ElementaryGamesPicture;
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
  picture?: ElementaryGamesPicture;
  image?: string;
  frames: RuleFrame[];
  question: { text: string; answer: string };
}

export interface QuizQuestion {
  text: string;
  picture?: ElementaryGamesPicture;
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
    id: 'own-pair',
    title: 'Hvatanje svog para',
    picture: 'pair-chase',
    frames: [
      { picture: 'pair-field', caption: 'Parovi u omeđenom prostoru', verdict: null, info: 'Igra se u omeđenom prostoru — pola sale ili teren 15 × 15 m. Svi su raspoređeni u parove. Uzrast: 5–8. razred osnovne škole.' },
      { picture: 'pair-chase', caption: 'Jedan juri, drugi beži', verdict: null, info: 'Na znak jedan iz para je lovac, a drugi beži. Lovac juri samo svog para i spretno zaobilazi ostale parove.' },
      { picture: 'swap-roles', caption: 'Dodir = promena uloga', verdict: 'ok', info: 'Kad lovac dodirne svog para rukom, uloge se menjaju: sada beži onaj koji je jurio. Novi lovac naglas izbroji 2–3 sekunde, pa tek onda kreće.' },
      { picture: 'push-bad', caption: 'Guranje i grubo hvatanje', verdict: 'bad', info: 'Dovoljan je dodir rukom po ramenu ili leđima. Guranje, grubo „hvatanje" i istrčavanje van prostora nisu dozvoljeni.' },
      { picture: 'walk-easy', caption: 'Lakše: brzim hodanjem', verdict: 'ok', info: 'Lakša varijanta: lovac i begunac se kreću samo brzim hodanjem. Teža varijanta: manji prostor ili zadat način kretanja (bočno, poskocima).' },
    ],
    question: { text: 'Šta radi novi lovac pre nego što krene?', answer: 'Naglas izbroji 2–3 sekunde.' },
  },
  {
    id: 'freeze',
    title: 'Ledeni čiča',
    picture: 'freeze-crawl',
    frames: [
      { picture: 'tag-zone', caption: '1–3 lovca', verdict: null, info: 'Ovo je hvatalica sa spasavanjem provlačenjem. U omeđenom prostoru su 1–3 obeležena lovca, a ostali slobodno trče. Uzrast: 5–8. razred.' },
      { picture: 'freeze-stand', caption: 'Dodirnut — zaleđen', verdict: null, info: 'Dodirnuti učenik ostaje na mestu u raskoračnom stavu, sa rukama u stranu — „zaleđen" je.' },
      { picture: 'freeze-crawl', caption: 'Spas kroz noge', verdict: 'ok', info: 'Slobodan saigrač spasava zaleđenog tako što se provuče kroz njegove raširene noge — oprezno, sa rukama napred. Posle toga oba nastavljaju igru.' },
      { picture: 'guard-bad', caption: 'Lovac ne čuva zaleđenog', verdict: 'bad', info: 'Lovci ne treba da stoje i „čuvaju" zaleđenog igrača, a ne smeju da dodiruju onoga ko se upravo provlači.' },
      { picture: 'touch-save', caption: 'Lakše: spas dodirom', verdict: 'ok', info: 'U jednoj od varijanti zaleđeni se spasava dodirom ruke umesto provlačenja. Lovci se menjaju posle 60–90 sekundi. Teže: više lovaca.' },
    ],
    question: { text: 'Kako se spasava zaleđeni drug?', answer: 'Provlačenjem kroz njegove raširene noge.' },
  },
  {
    id: 'chain',
    title: 'Hvatanje u lancu',
    picture: 'chain-ends',
    frames: [
      { picture: 'chain-start', caption: 'Dva lovca za ruke', verdict: null, info: 'Dva lovca se drže za ruke i hvataju ostale u omeđenom prostoru (pola sale ili rukometni teren). Uzrast: 5–8. razred.' },
      { picture: 'chain-ends', caption: 'Hvataju samo krajnji', verdict: 'ok', info: 'Uhvaćeni se priključuje i lanac raste. Dodir smeju da daju samo dva krajnja igrača; ostali u lancu ne hvataju, nego zatvaraju put beguncu.' },
      { picture: 'chain-under', caption: 'Ispod ruku — sme', verdict: 'ok', info: 'Begunci smeju da se provuku ispod spojenih ruku lanca. Igra traje dok se ne uhvate svi.' },
      { picture: 'chain-break', caption: 'Pukao lanac — ne važi', verdict: 'bad', info: 'Ako se lanac pokida, dodir ne važi. Zabranjeno je probijanje lanca telom i naglo „bičevanje" lanca.' },
      { picture: 'chain-split', caption: 'Lakše: deli se na parove', verdict: 'ok', info: 'Lakša varijanta: kad lanac dostigne četiri igrača, deli se u dva para lovaca. Tako se igra i „Hvatanje udvoje", gde par koji pusti ruke takođe ne važi.' },
    ],
    question: { text: 'Ko u lancu sme da hvata?', answer: 'Samo dva krajnja igrača.' },
  },
  {
    id: 'help',
    title: 'Druže, pomozi!',
    picture: 'help-hands',
    frames: [
      { picture: 'one-chaser', caption: 'Jedan lovac', verdict: null, info: 'Jedan učenik hvata (u većem odeljenju dva, obeležena), a ostali beže u omeđenom prostoru. Uzrast: 5–7. razred.' },
      { picture: 'help-hands', caption: 'Za ruke = zaštićeni', verdict: 'ok', info: 'Kad se lovac približi, begunac uhvati nekog saigrača za ruku. Dok se dvojica drže za ruke, ne mogu biti uhvaćeni.' },
      { picture: 'count-three', caption: 'Najviše 3 sekunde', verdict: 'bad', info: 'Par je zaštićen samo kratko — najviše 3 sekunde, pa se moraju pustiti. Inače igra stane. Uhvaćeni postaje novi lovac.' },
      { picture: 'help-trio', caption: 'Teže: samo trojka', verdict: 'ok', info: 'Teža varijanta: zaštitu daje samo trojka koja se drži za ruke, a igraju dva lovca. Za ruke se hvata bez naglog povlačenja.' },
    ],
    question: { text: 'Koliko dugo par sme da se drži za ruke?', answer: 'Najviše 3 sekunde.' },
  },
  {
    id: 'third',
    title: 'Lovi trećeg',
    picture: 'third-stop',
    frames: [
      { picture: 'third-circle', caption: 'Krug od parova', verdict: null, info: 'Parovi stoje u velikom krugu, jedan iza drugog, licem ka sredini, na razmaku 2–3 m. Jedan lovac i jedan begunac su izvan kruga. Ovo je školski oblik igre tipa „Mačka i miš". Uzrast: 5–8. razred.' },
      { picture: 'third-stop', caption: 'Stani ispred para', verdict: 'ok', info: 'Begunac se spasava tako što stane ispred nekog para. Tog trenutka zadnji iz para postaje „treći" i mora da beži.' },
      { picture: 'swap-roles', caption: 'Dodir = zamena uloga', verdict: 'ok', info: 'Ako lovac dodirne begunca, uloge se menjaju: on sada lovi, a lovac beži. Brz „treći" može odmah da dodirne lovca i zameni uloge.' },
      { picture: 'third-long', caption: 'Najviše jedan krug', verdict: 'bad', info: 'Begunac ne sme da trči predugo — stane ispred para najkasnije posle jednog kruga, da igra ne bude jednolična. Trči se u dogovorenom pravcu, da nema sudara.' },
    ],
    question: { text: 'Ko beži kad begunac stane ispred para?', answer: 'Zadnji iz tog para — „treći".' },
  },
  {
    id: 'hares',
    title: 'Lov na zečeve',
    picture: 'hares-cross',
    frames: [
      { picture: 'one-chaser', caption: 'Lovac i zečevi', verdict: null, info: 'Jedan učenik je lovac (obeležen), ostali su zečevi u omeđenom prostoru. Uzrast: 5–7. razred.' },
      { picture: 'hares-cross', caption: 'Pretrči i spasi', verdict: 'ok', info: 'Kad je neki zec u opasnosti, drugi zec pretrči između njega i lovca. Lovac tada mora da juri onoga ko mu je poslednji pretrčao put. Uhvaćeni zec postaje lovac.' },
      { picture: 'hares-close', caption: 'Preblizu lovcu', verdict: 'bad', info: 'Pretrčava se na bezbednom razmaku od lovca, da ne dođe do sudara.' },
      { picture: 'hares-hop', caption: 'Teže: poskoci, 2 lovca', verdict: 'ok', info: 'Varijante: dva lovca; zečevi se kreću samo poskocima; posle 60 sekundi nastavnik određuje novog lovca. Igra je zanimljivija što je više zečeva.' },
    ],
    question: { text: 'Koga juri lovac u „Lovu na zečeve"?', answer: 'Onoga ko mu je poslednji pretrčao put.' },
  },
  {
    id: 'ball-save',
    title: 'Spašavanje loptom',
    picture: 'ballsave-pass',
    frames: [
      { picture: 'ballsave-field', caption: '2–3 lovca, 2–4 lopte', verdict: null, info: 'Hvatalica u omeđenom prostoru: 2–3 lovca, a među beguncima 2–4 lopte. Uzrast: 5–8. razred i 1. razred srednje škole.' },
      { picture: 'ballsave-safe', caption: 'Sa loptom si zaštićen', verdict: 'ok', info: 'Lovci mogu da uhvate samo onoga ko nema loptu u rukama. Uhvaćeni postaje lovac (ili ide u pomoć lovcima).' },
      { picture: 'ballsave-pass', caption: 'Dodaj ugroženom', verdict: 'ok', info: 'Ugroženog saigrača spasavaš tako što mu dodaš loptu. Dodaje se iz kratke daljine, nikad u glavu.' },
      { picture: 'ballsave-hold', caption: 'Duže od 3 sekunde', verdict: 'bad', info: 'Loptu ne sme dugo da drži isti učenik — mora je dodati u roku od 3 sekunde. Lakše: više lopti i jedan lovac.' },
    ],
    question: { text: 'Koga lovci smeju da uhvate?', answer: 'Samo onoga ko nema loptu u rukama.' },
  },
  {
    id: 'relay',
    title: 'Susretna štafeta',
    picture: 'relay-touch',
    frames: [
      { picture: 'relay-setup', caption: 'Dve polovine kolone', verdict: null, info: '3–5 kolona po 6–8 učenika. Svaka kolona je podeljena na dve polovine koje stoje jedna naspram druge, na 10–20 m. Uzrast: 5–8. razred i srednja škola.' },
      { picture: 'relay-touch', caption: 'Predaja dodirom ruke', verdict: 'ok', info: 'Na znak čelni trči do partnera na suprotnoj strani i dodirne ga rukom — tek tada partner kreće. Ko je predao, staje na začelje te polovine. Pobeđuje kolona koja prva završi.' },
      { picture: 'relay-early', caption: 'Krenuo pre dodira', verdict: 'bad', info: 'Start pre dodira je greška — nastavnik daje ponavljanje ili kazneni bod.' },
      { picture: 'relay-right', caption: 'Desnom stranom', verdict: 'ok', info: 'Razmak između kolona je bar 2–3 m, a staza i povratak su obavezno desnom stranom, da se trkači ne sudare. Lakše: prvi krug laganim trčanjem.' },
    ],
    question: { text: 'Kada sme da krene sledeći trkač?', answer: 'Tek kad ga saigrač dodirne rukom.' },
  },
  {
    id: 'slalom',
    title: 'Štafeta slalomom sa loptom',
    picture: 'slalom-dribble',
    frames: [
      { picture: 'slalom-cones', caption: '4–6 čunjeva na 2 m', verdict: null, info: 'Kolone su podeljene kao kod susretne štafete, a između polovina je 4–6 čunjeva u nizu, na razmaku od 2 m. Uzrast: 5–8. razred, 1–2. razred srednje škole.' },
      { picture: 'slalom-carry', caption: 'Lopta u rukama', verdict: 'ok', info: 'Čelni nosi loptu u rukama, trči slalomom između čunjeva i predaje je saigraču na suprotnoj strani — dodir i predaja iz ruke u ruku.' },
      { picture: 'slalom-dribble', caption: 'Stariji: vođenje lopte', verdict: 'ok', info: 'Stariji vode loptu rukom (košarka, rukomet) ili nogom (fudbal) kroz slalom. Teže: slabijom rukom ili nogom kroz gušći slalom.' },
      { picture: 'slalom-skip', caption: 'Preskočen ili oboren čunj', verdict: 'bad', info: 'Greške su preskakanje čunja, obaranje čunjeva i bacanje lopte umesto predaje. Razmak između kolona je bar 3 m.' },
    ],
    question: { text: 'Kako se lopta predaje saigraču?', answer: 'Iz ruke u ruku, uz dodir — ne baca se.' },
  },
  {
    id: 'lead',
    title: 'Povedi drugare',
    picture: 'lead-grow',
    frames: [
      { picture: 'lead-setup', caption: 'Oznaka na 10–15 m', verdict: null, info: 'Štafeta lanac: 2–4 kolone po 6–8 učenika, razmak između kolona bar 5 m. Ispred svake kolone, na 10–15 m, je lopta ili čunj. Uzrast: 5–7. razred.' },
      { picture: 'lead-grow', caption: 'Lanac raste', verdict: 'ok', info: 'Prvi obiđe oznaku, vrati se, uhvati sledećeg za ruku i zajedno ponove. Lanac raste dok se ne izvedu svi. Pobeđuje ekipa koja prva izvede sve.' },
      { picture: 'lead-break', caption: 'Pustili ruke — stani', verdict: 'bad', info: 'Ako lanac pusti ruke, staje i ponovo se spaja pre nastavka.' },
      { picture: 'walk-easy', caption: 'Najsporiji vodi tempo', verdict: 'ok', info: 'Najsporiji u lancu diktira tempo — prvi ne vuče ostale i nema naglog povlačenja za ruke. Lakše: kraća distanca (8–10 m) i manje kolone.' },
    ],
    question: { text: 'Šta radite kad lanac pusti ruke?', answer: 'Stanete i ponovo se spojite.' },
  },
  {
    id: 'colors',
    title: 'Igra boja',
    picture: 'colors-call',
    frames: [
      { picture: 'colors-free', caption: 'Kretanje u svim pravcima', verdict: null, info: 'Učenici slobodno hodaju i lagano trče po sali, u svim pravcima — ne svi istim krugom. Uzrast: 5–8. razred, 1–2. razred srednje škole.' },
      { picture: 'colors-call', caption: '„Plava!" — dodirni', verdict: 'ok', info: 'Na komandu nastavnika („plava", „bela linija", „strunjača") što brže dotakneš zadatu boju, liniju ili predmet i nastaviš kretanje. Komande se smenjuju sve brže.' },
      { picture: 'push-bad', caption: 'Guranje kod cilja', verdict: 'bad', info: 'Kod cilja nema guranja. Zato su ciljevi veliki — linije i zidovi — da se ne stvara gužva.' },
      { picture: 'colors-body', caption: 'Teže: dodir laktom', verdict: 'ok', info: 'Varijante: dodir određenim delom tela (lakat, koleno), dve komande odjednom, uz vođenje lopte ili vođa igre je učenik. Igra razvija brzinu reakcije i promenu pravca.' },
    ],
    question: { text: 'Šta radiš kad nastavnik kaže boju?', answer: 'Što brže dotakneš tu boju i nastaviš kretanje.' },
  },
  {
    id: 'who-first',
    title: 'Ko će pre',
    picture: 'first-grab',
    frames: [
      { picture: 'first-setup', caption: 'Par, čunj i loptica', verdict: null, info: 'Parovi stoje naspram sebe na oko 70 cm, između njih je čunj sa lopticom. Početni položaj: blagi pretklon, ruke na kolenima. Uzrast: 5–8. razred i 1. razred srednje škole.' },
      { picture: 'first-call', caption: '„Koleno!" — dodirni', verdict: 'ok', info: 'Nastavnik nabraja delove tela (glava, koleno, stopalo), a učenici ih dodiruju.' },
      { picture: 'first-grab', caption: '„Loptica!" — uzmi', verdict: 'ok', info: 'Na dogovorenu reč („loptica") svako pokušava prvi da uzme lopticu — samo rukom. Pobeđuje ko prvi skupi 5 pobeda, pa se menja par.' },
      { picture: 'first-early', caption: 'Krenuo pre reči', verdict: 'bad', info: 'Ko krene pre reči, daje bod protivniku. Glava se ne naginje napred — razmak od 70 cm čuva od sudara glavama.' },
    ],
    question: { text: 'Šta dobija protivnik ako kreneš pre reči?', answer: 'Bod.' },
  },
  {
    id: 'father-son',
    title: 'Sine, gde si?',
    picture: 'son-call',
    frames: [
      { picture: 'son-circle', caption: 'Krug, otac i sin', verdict: null, info: 'Učenici stoje u krugu i čuvaju granicu. U sredini su „otac" i „sin", obojica sa povezom preko očiju. Mirna igra za završni deo časa. Uzrast: 5–8. razred.' },
      { picture: 'son-call', caption: '„Sine, gde si?" — „Tu sam!"', verdict: 'ok', info: 'Otac pita kad hoće, a sin mora odmah da odgovori „Tu sam!" i promeni mesto. Otac ga hvata po zvuku. Kad ga uhvati (ili posle 60 s), ulazi novi par.' },
      { picture: 'son-run', caption: 'Samo hodanje', verdict: 'bad', info: 'U krugu se ne trči — samo hoda. Igrači u krugu ćute, ne dobacuju i dlanovima nežno vraćaju u krug onoga ko naiđe na njih.' },
      { picture: 'son-easy', caption: 'Lakše: povez samo otac', verdict: 'ok', info: 'Lakša varijanta: povez ima samo otac, a sin se kreće otvorenih očiju, ali samo hodanjem. Teže: dva sina u krugu.' },
    ],
    question: { text: 'Zašto se ova igra igra na kraju časa?', answer: 'Mirna je, traži pažnju i tišinu i smiruje odeljenje.' },
  },
  {
    id: 'two-fires',
    title: 'Između dve vatre',
    picture: 'fires-court',
    frames: [
      { picture: 'fires-court', caption: 'Dve ekipe, dva polja', verdict: null, info: 'Teren je dug 16–18 m i širok 8–9 m, poprečnom linijom podeljen na dve polovine. Odeljenje se deli na dve ujednačene ekipe, svaka na svojoj polovini. Svaka ekipa bira „kapitena" — najveštijeg sa loptom — koji stoji iza protivničkog polja. Igra se loptom za odbojku.' },
      { picture: 'fires-hit', caption: 'Pogođen — ide kod kapitena', verdict: null, info: 'Ekipa koja ima loptu gađa protivnike, a oni beže ili hvataju loptu. Pogođeni igrač izlazi iz polja i pridružuje se svom kapitenu iza protivničkog polja — odatle i on gađa.' },
      { picture: 'fires-catch', caption: 'Uhvaćena lopta ne važi', verdict: 'ok', info: 'Pogodak ne važi ako igrač uhvati loptu pre nego što padne na pod, ili ako je uhvati njegov saigrač.' },
      { picture: 'fires-captain', caption: 'Na kraju ulazi kapiten', verdict: null, info: 'Kad su pogođeni svi igrači jedne ekipe, u polje ulazi njen kapiten i dobija loptu. Kad i on bude pogođen, igra je gotova i pobeđuje druga ekipa. Ko počinje, određuje se žrebom ili skokom dvojice igrača na sredini, kao u košarci.' },
      { picture: 'four-fires', caption: 'Varijanta: između četiri vatre', verdict: 'ok', info: 'U varijanti „između četiri vatre" pogođeni se ravnomerno raspoređuju na tri strane oko protivničkog polja, pa svaku ekipu protivnici gađaju sa sve četiri strane. Igra se završava aplauzom svih učenika.' },
    ],
    question: { text: 'Pogođen si, ali si uhvatio loptu pre nego što je pala. Ispadaš li?', answer: 'Ne — pogodak ne važi.' },
  },
  {
    id: 'border',
    title: 'Graničar',
    picture: 'border-court',
    frames: [
      { picture: 'border-court', caption: 'Odbojkaški teren i graničar', verdict: null, info: 'Ovo su pravila školskog takmičenja u graničaru za mlađe razrede. Igra se na odbojkaškom terenu 18 × 9 m. Svaka ekipa ima u svom polju 8 igrača (4 dečaka i 4 devojčice) i jednog graničara, koji stoji iza osnovne linije protivničkog polja — protivnici su između njega i njegove ekipe.' },
      { picture: 'border-hit', caption: 'Pogodak = poen', verdict: null, info: 'Ekipa gađa protivnike u njihovom polju mekanom, spužvastom loptom prečnika 18–20 cm. Poen se dobija kad lopta direktno pogodi igrača pa padne na pod; ako pogodi više igrača — poen za svakog. Pogođeni ne ispada, već nastavlja igru sa loptom. Set traje 9 minuta ili dok neko ne osvoji 15 poena; igra se na dva dobijena seta.' },
      { picture: 'border-save', caption: 'Hvatanje i spašavanje', verdict: 'ok', info: 'Ako igrač uhvati loptu kojom je gađan, nema poena i igra teče dalje. Ako se lopta odbije od pogođenog igrača, saigrač je može „spasiti" hvatanjem pre nego što padne.' },
      { picture: 'border-pass', caption: 'Najviše dva dodavanja', verdict: 'bad', info: 'Ekipa i graničar smeju da dodaju loptu najviše dva puta zaredom — treći put moraju da gađaju. Lopta se ne vodi, ne dodaje se saigraču u svom polju i ne zadržava se duže od 3 sekunde.' },
      { picture: 'border-line', caption: 'Ne prelazi liniju', verdict: 'bad', info: 'Ne sme se stati na liniju ni preći u protivničko polje. Ko izađe iz svog polja da bi izbegao pogodak, protivnik dobija poen.' },
    ],
    question: { text: 'Koliko puta zaredom ekipa sme da doda loptu?', answer: 'Najviše dva puta — treći put mora da gađa.' },
  },
  {
    id: 'fair-play',
    title: 'Fer-plej i bezbednost',
    picture: 'touch-ok',
    frames: [
      { picture: 'touch-ok', caption: 'Dodir, ne guranje', verdict: 'ok', info: 'U igrama hvatanja dovoljan je dodir rukom po ramenu ili leđima — bez guranja i bez hvatanja za odeću.' },
      { picture: 'space-ok', caption: 'Linija ispred zida', verdict: 'ok', info: 'Prostor mora biti dovoljno velik za sve igrače. Ako zid nije zaštićen, dodiruje se linija 1–2 m ispred njega, a ne zid u punom trku.' },
      { picture: 'look-bad', caption: 'Juriš kroz gomilu', verdict: 'bad', info: 'Ne juri se kroz gomilu bez gledanja. Pazi na sudare kad se naglo okrećeš.' },
      { picture: 'rules-teacher', caption: 'Nastavnik prati pravila', verdict: null, info: 'Nastavnik usmerava igru, insistira na poštovanju pravila igre i vodi računa o opterećenju. Pravila se dogovore pre početka.' },
      { picture: 'all-in', caption: 'Mali zadatak umesto ispadanja', verdict: 'ok', info: 'Uloge se često menjaju. Umesto ispadanja poslednji dobija mali zadatak, na primer 3 čučnja — da niko ne stoji i ne čeka.' },
    ],
    question: { text: 'Šta je dovoljno da uhvatiš druga?', answer: 'Dodir rukom po ramenu ili leđima.' },
  },
];

export const QUIZ: QuizQuestion[] = [
  { text: 'U igri „između dve vatre" gde ide pogođeni igrač?', picture: 'fires-hit', options: ['Na klupu do kraja', 'Kod svog kapitena iza protivničkog polja', 'U protivničku ekipu'], correct: 1, explanation: 'Pogođeni se pridružuje kapitenu i odatle gađa.' },
  { text: 'U graničaru, šta je pogodak?', picture: 'border-hit', options: ['Lopta pogodi igrača pa padne na pod', 'Lopta padne u polje', 'Lopta pogodi graničara'], correct: 0, explanation: 'Poen je kad lopta direktno pogodi igrača pa padne na pod.' },
  { text: 'U „Ledenom čiči" zaleđenog druga spasavaš…', picture: 'freeze-crawl', options: ['provlačenjem kroz njegove noge', 'guranjem', 'glasnim vikanjem'], correct: 0, explanation: 'Slobodan saigrač se oprezno provuče kroz raširene noge zaleđenog.' },
  { text: 'U hvatanju u lancu ko sme da hvata?', picture: 'chain-ends', options: ['Svi u lancu', 'Samo dva krajnja', 'Samo prvi lovac'], correct: 1, explanation: 'Hvataju samo krajnji, a ostali zatvaraju put.' },
  { text: 'Lanac se pokidao i krajnji je dodirnuo begunca. Važi li?', picture: 'chain-break', options: ['Važi', 'Ne važi', 'Važi samo jednom'], correct: 1, explanation: 'Kad se lanac pokida, dodir ne važi.' },
  { text: 'U susretnoj štafeti sledeći trkač kreće…', picture: 'relay-touch', options: ['kad čuje zvižduk', 'kad ga saigrač dodirne rukom', 'kad saigrač pređe pola puta'], correct: 1, explanation: 'Predaja je dodirom ruke — start pre dodira je greška.' },
  { text: 'Šta je ovo?', picture: 'push-bad', options: ['Dozvoljeno', 'Guranje — nije dozvoljeno', 'Spasavanje'], correct: 1, explanation: 'Dovoljan je dodir rukom po ramenu ili leđima, bez guranja.' },
  { text: 'U igri „Druže, pomozi!" par sme da se drži za ruke…', options: ['najviše 3 sekunde', 'do kraja igre', '10 sekundi'], correct: 0, explanation: 'Najviše 3 sekunde, pa se moraju pustiti.' },
  { text: 'U igri „Spasavanje loptom" lovac sme da uhvati…', picture: 'ballsave-safe', options: ['svakoga', 'samo onoga ko nema loptu', 'samo onoga ko ima loptu'], correct: 1, explanation: 'Ko drži loptu, zaštićen je — ali mora je dodati u roku od 3 sekunde.' },
  { text: 'U „Lovi trećeg" begunac stane ispred para. Ko sada beži?', picture: 'third-stop', options: ['Prvi iz para', 'Zadnji iz para — treći', 'Lovac'], correct: 1, explanation: 'Zadnji iz para postaje „treći" i mora da beži.' },
  { text: 'U igri „Ko će pre" krenuo si pre reči „loptica". Šta sledi?', picture: 'first-early', options: ['Bod protivniku', 'Bod tebi', 'Ništa'], correct: 0, explanation: 'Ko krene pre reči, daje bod protivniku.' },
  { text: 'Kako se kreće u krugu u igri „Sine, gde si?"', picture: 'son-run', options: ['Trčanjem', 'Samo hodanjem', 'Skokovima'], correct: 1, explanation: 'Unutar kruga dozvoljeno je samo hodanje.' },
];

export const RULE_DOCUMENT_GROUPS: RuleDocumentGroup[] = [
  {
    title: 'Igre gađanja loptom',
    description: '„Između dve vatre" i graničar igraju se u mnogo varijanti. U igraonici je varijanta sa kapitenima iz opisa nastavnice fizičkog vaspitanja, varijanta „između četiri vatre" iz stručnog časopisa i pravila školskog takmičenja u graničaru.',
    documents: [
      { title: 'Elementarne igre u nastavi fizičkog vaspitanja — „Između dve vatre"', note: 'blog nastavnice fizičkog vaspitanja (nezvaničan izvor)', url: 'https://arsenijevicnina.blogspot.com/2019/11/blog-post.html', language: 'sr', format: 'sajt' },
      { title: 'Primena elementarnih motoričkih igara u uvodnoj fazi časa', note: 'Sport – nauka i praksa, Vol. 4, br. 1, 2014, str. 47–64 — „između četiri vatre"', url: 'https://sportnaukaipraksa.vss.edu.rs/pdf/SNP-04-01/PRIMENA-ELEMENTARNIH-MOTORICKIH-IGARA.pdf', language: 'sr', format: 'PDF' },
      { title: 'Graničar — posebne odredbe školskog takmičenja', note: 'Školski sportski savez Grada Zagreba — teren, lopta, pogodak, dodavanja, prekršaji', url: 'https://skolski-sport-zg.hr/dokumenti/6372-Posebne_odredbe_grani%C4%8Dar.pdf', language: 'sr', format: 'PDF' },
    ],
  },
  {
    title: 'Elementarne igre u nastavi',
    description: 'Elementarne igre nemaju zvanična pravila — iste igre se igraju u mnogo varijanti. U igraonici su opisane varijante iz ovih nastavnih materijala Fakulteta sporta i fizičkog vaspitanja Univerziteta u Nišu.',
    documents: [
      { title: 'Elementarne igre kao sredstvo uvodnog dijela sata', note: 'FSFV Niš, Metodika fizičkog vaspitanja — hvatanje u lancu i udvoje, Druže pomozi, Lovi trećeg, Lov na zečeve, Sine gde si', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/12-ELEMENTARNE-IGRE.pdf', language: 'sr', format: 'PDF' },
      { title: 'Vežbe – prvi deo: čas fizičkog vaspitanja', note: 'FSFV Niš, 2020 — uvodni deo časa, hvatanje svog para, štafete, spasavanje loptom', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/Vezbe-prvi-deo.pdf', language: 'sr', format: 'PDF' },
      { title: 'Mini rukomet — primeri plana časa', note: 'Saša Marković, Marija Lukić, FSFV Niš — Ledeni čiča, igra boja', url: 'https://www.fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/mini_rukomet/decembar/primeri_plana_casa.pdf', language: 'sr', format: 'PDF' },
    ],
  },
  {
    title: 'Priručnici sa igrama',
    description: 'Zbirka igara za saradnju i fer-plej, sa opisom organizacije i varijantama.',
    documents: [
      { title: 'Igre za svakoga', note: 'Dražen Mihajlović, projekat Sport za razvoj (GIZ), 2020 — Povedi drugare, Ko će pre', url: 'https://www.sport-for-development.com/imglib/downloads/Manuale/Western%20Balkan/mihajlovi%C4%87-giz-2020-bcms-manual-igre-za-scakoga.pdf', language: 'sr', format: 'PDF' },
    ],
  },
];

export const RULE_SOURCE_URL = 'https://www.fsfv.ni.ac.rs/files/documents/oas/cetvrta_godina/metodika_fiz_vaspitanja/skolska_20_21/12-ELEMENTARNE-IGRE.pdf';
