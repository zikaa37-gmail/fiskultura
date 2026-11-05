export type TestPicture =
  | 'height'
  | 'mass'
  | 'sit-and-reach'
  | 'standing-jump'
  | 'sit-ups'
  | 'flexed-arm-hang'
  | 'shuttle-4x10'
  | 'shuttle-run-20'
  | 'sprint-30'
  | 'medicine-ball'
  | 'wall-ball'
  | 'bench-reach'
  | 'endurance-run'
  | 'pull-ups'
  | 'cross-course'
  | 'relay';

export interface TestSource {
  title: string;
  publisher: string;
  year: string;
  url: string;
  pages?: string;
}

export interface TestGuide {
  id: string;
  name: string;
  measures: string;
  picture: TestPicture;
  equipment: string[];
  setup?: string;
  execution: string[];
  result: string;
  errors: string[];
  safety?: string;
  sayToStudents?: string;
  source: TestSource;
}

export interface BatteryGuide {
  id: 'zdravitas' | 'old';
  tab: string;
  title: string;
  intro: string[];
  tests: TestGuide[];
  organization: { title: string; items: string[] }[];
  sources: TestSource[];
}

export interface ReferenceRow {
  grade: number;
  values: [number, number][];
}

export interface ReferenceTable {
  battery: BatteryGuide['id'];
  title: string;
  note: string;
  columns: string[];
  lowerIsBetter: boolean[];
  groups: { label: string; rows: ReferenceRow[] }[];
  source: TestSource;
}

const ZUOV_HANDBOOK: TestSource = {
  title: 'Priručnik za praćenje fizičkog razvoja i razvoja motoričkih sposobnosti učenika u nastavi fizičkog i zdravstvenog vaspitanja',
  publisher: 'Zavod za unapređivanje obrazovanja i vaspitanja (ZUOV)',
  year: '2019',
  url: 'https://zuov.gov.rs/wp-content/uploads/2020/01/PRIRUCNIK-PRACENJE-FIZ-RAZVOJA-I-MOTORICKIH-SPOSOBNSOTI-SREDNJE-SKOLE.pdf',
};

const handbook = (pages: string): TestSource => ({ ...ZUOV_HANDBOOK, pages });

export const ZDRAVITAS_BATTERY: BatteryGuide = {
  id: 'zdravitas',
  tab: 'Nacionalna baterija (Zdravitas)',
  title: 'Nacionalna baterija testova — Zdravitas',
  intro: [
    'Ovo je baterija Sistema kontinuiranog praćenja fizičkog razvoja i motoričkih sposobnosti učenika. U program fizičkog i zdravstvenog vaspitanja za osnovnu školu ušla je 2017/18, za gimnazije 2018/19. Rezultati se unose u državni portal Zdravitas.',
    'U 1. i 2. razredu osnovne škole prate se samo visina, masa i indeks telesne mase; motorički testovi rade se od 3. razreda osnovne i u srednjoj školi.',
    'Testira se dva puta godišnje: na početku školske godine (okvirno od 20. septembra do 20. oktobra) i na kraju (u maju). Za jedno odeljenje dovoljna su tri školska časa.',
    'Rezultati se ne koriste za ocenjivanje ni za poređenje učenika. Učenik dobija povratnu informaciju u odnosu na svoj prethodni rezultat i na kriterijumske referentne vrednosti, uz praktičan savet za vežbanje.',
  ],
  tests: [
    {
      id: 'height',
      name: 'Visina tela',
      measures: 'Fizički rast',
      picture: 'height',
      equipment: ['Stadiometar (visinomer)'],
      execution: [
        'Učenik je bos, u opremi za fizičko, i stoji uspravno na čvrstoj podlozi.',
        'Ispravi leđa koliko može, spoji stopala, a glava je u položaju frankfurtske ravni (pogled pravo).',
        'Merilac stoji sa leve strane, proveri da je kičma uz skalu stadiometra i spusti horizontalni graničnik do temena.',
      ],
      result: 'Očitava se na skali u visini gornje strane trouglog proreza graničnika, sa tačnošću od 0,1 cm.',
      errors: ['Učenik u obući ili na prstima.', 'Glava zabačena unazad ili spuštena.'],
      sayToStudents: 'Izuj se i stani leđima uz skalu, stopala spojena. Ispravi se i gledaj pravo ispred sebe.',
      source: handbook('11'),
    },
    {
      id: 'mass',
      name: 'Masa tela i indeks telesne mase (BMI)',
      measures: 'Fizički rast i sastav tela',
      picture: 'mass',
      equipment: ['Vaga sa tačnošću od 0,1 kg'],
      setup: 'Vaga stoji na čvrstoj, vodoravnoj podlozi.',
      execution: [
        'Učenik je bos, u opremi za fizičko, i stoji na sredini vage u uspravnom stavu.',
        'Gleda pravo i ne pomera se dok se merenje ne završi.',
        'Nastavnik očitava rezultat na displeju vage.',
      ],
      result: 'Masa u kg (0,1 kg). Indeks telesne mase: BMI = masa (kg) / visina² (m²).',
      errors: ['Vaga na neravnoj ili mekoj podlozi.', 'Učenik se pomera tokom merenja.'],
      safety: 'Masu i BMI saopštavati diskretno, bez komentara pred odeljenjem.',
      source: handbook('11, 23'),
    },
    {
      id: 'sit-and-reach',
      name: 'Pretklon u sedu',
      measures: 'Gipkost donjeg dela kičmenog stuba i zadnje lože buta',
      picture: 'sit-and-reach',
      equipment: [
        'Drveni sanduk dužine 45 cm, širine 35 cm i visine 32 cm',
        'Gornja ploča 60 × 35 cm, prelazi 15 cm preko strane sanduka uz koju se oslanjaju stopala',
        'Skala od 0 do 60 cm na sredini gornje ploče, sa kliznim lenjirom',
      ],
      execution: [
        'Učenik sedne bos ispred sanduka i ispruženim nogama postavi stopala na prednju stranu sanduka.',
        'Nastavnik klekne pored učenika i pritiskom na kolena sprečava da ih pogrči.',
        'Sa ispruženim rukama (jedna preko druge) učenik se, ne grčeći noge, nagne napred što više i ravnomerno, bez zamaha, gura klizni lenjir.',
      ],
      result: 'Najdalja pozicija koju učenik dosegne vrhovima prstiju. Test se ponavlja dva puta i upisuje se bolji rezultat (cm).',
      errors: ['Zamah ili trzaj.', 'Pogrčena kolena.'],
      safety: 'Ne testirati gipkost na ranim jutarnjim časovima; učenici moraju biti dobro zagrejani.',
      sayToStudents: 'Sedi, stopala uz sanduk, kolena ispružena. Ruke jedna preko druge, pa polako, bez trzaja, gurni lenjir što dalje.',
      source: handbook('12–13, 21'),
    },
    {
      id: 'standing-jump',
      name: 'Skok udalj iz mesta',
      measures: 'Mišićna (eksplozivna) snaga nogu',
      picture: 'standing-jump',
      equipment: ['Merna traka sa tačnošću od 1 cm', 'Ravna, ali ne klizava površina sa obeleženim skakalištem; mesto odraza na istom nivou kao mesto doskoka'],
      execution: ['Učenik u opremi za fizičko stoji iza linije odraza.', 'Sunožnim odrazom skoči što dalje i doskoči sunožno.'],
      result: 'Meri se od linije odraza do tačke dodira pete sa podlogom koja je najbliža liniji. Izvode se tri skoka, upisuje se najdalji (cm).',
      errors: ['Odraz ili doskok nisu sunožni — nepravilan skok se ponavlja.'],
      sayToStudents: 'Stani iza linije, zamahni rukama i odrazi se objema nogama odjednom što dalje. Doskoči na obe noge.',
      source: handbook('13'),
    },
    {
      id: 'sit-ups',
      name: 'Ležanje-sed za 30 sekundi',
      measures: 'Izdržljivost u snazi mišića trupa',
      picture: 'sit-ups',
      equipment: ['Strunjača', 'Štoperica'],
      execution: [
        'Učenik leži na leđima, ruke na potiljku, noge pogrčene u kolenima pod uglom od 90°.',
        'Drugi učenik (pomoćnik) mu fiksira stopala.',
        'Iz ležećeg položaja učenik pravi što više pregibanja napred, tako da svaki put laktovima dodirne kolena.',
      ],
      result: 'Broj pravilno urađenih podizanja trupa za 30 sekundi.',
      errors: ['Laktovi ne dodiruju kolena.', 'Šake se odvajaju od potiljka.'],
      sayToStudents: 'Lezi, ruke na potiljak, kolena savijena. Na znak podiži se dok laktovima ne dodirneš kolena, pa nazad. Što više za 30 sekundi.',
      source: handbook('14, 22'),
    },
    {
      id: 'flexed-arm-hang',
      name: 'Izdržaj u zgibu na vratilu',
      measures: 'Izdržljivost u snazi ruku i ramenog pojasa',
      picture: 'flexed-arm-hang',
      equipment: ['Doskočno vratilo', 'Štoperica'],
      execution: [
        'Učenik se uz pomoć stolice ili nastavnika hvata za pritku pothvatom, u širini ramena; brada je iznad ili u visini pritke.',
        'Kad zauzme početni položaj, pušta se (ili se uklanja stolica) i nastavnik uključuje štopericu.',
        'Učenik drži opružene noge i ne sme da se ljulja.',
      ],
      result: 'Štoperica se zaustavlja kad se brada spusti ispod visine pritke. Rezultat u sekundama.',
      errors: ['Ljuljanje ili savijanje nogu.'],
      safety: 'Gojaznu decu ne izlagati neuspehu ako je očigledno da test ne mogu da izvedu; sa njima napraviti individualni plan aktivnosti.',
      source: handbook('14, 23'),
    },
    {
      id: 'shuttle-4x10',
      name: 'Čunasto trčanje 4 × 10 m',
      measures: 'Agilnost',
      picture: 'shuttle-4x10',
      equipment: ['Čist, neklizav pod', 'Dva sunđera', 'Štoperica'],
      setup: 'Na razmaku od 10 m nacrtaju se ili obeleže (kredom ili trakom u boji) dve paralelne linije duge 1,2 m. Dva sunđera stoje na drugoj liniji.',
      execution: [
        'Na znak učenik trči što brže do druge linije, pređe je stopalom jedne noge i uzme prvi sunđer.',
        'Okrene se, vrati istim pravcem, pređe stopalom startnu liniju i ostavi sunđer.',
        'Ponovo trči do druge linije po drugi sunđer, okrene se i sprintom pretrči startnu liniju — ukupno 40 m.',
      ],
      result: 'Vreme od datog znaka do prelaska startne linije punim stopalom posle četiri pretrčane deonice od 10 m (s).',
      errors: ['Učenik ne pređe liniju stopalom ili ne trči pravom putanjom — merenje se ponavlja.'],
      source: handbook('15–16'),
    },
    {
      id: 'shuttle-run-20',
      name: 'Šatl ran — trčanje na 20 m sa progresivnim povećanjem brzine',
      measures: 'Kardiorespiratorna izdržljivost',
      picture: 'shuttle-run-20',
      equipment: ['Uređaj za puštanje snimljenog zvučnog signala', 'Štoperica', 'Staza dužine 20 m'],
      execution: [
        'Učenici trče između dve linije udaljene 20 m, u tempu zvučnog signala. Na svaki signal učenik mora biti sa oba stopala preko linije.',
        'Početna brzina je 8,5 km/h (20 m za 9 s), što odgovara laganom trčanju; svakog minuta brzina raste za 0,5 km/h.',
        'Test se prekida kad učenik više ne može da prati tempo, odnosno kad tri puta zaredom ne stigne da pređe liniju na signal.',
      ],
      result: 'Vreme odustajanja (minute i sekunde), mereno štopericom. Beleže ga nastavnik i kontrolni merilac (učenik).',
      errors: ['Okret pre linije — na svaki signal oba stopala moraju biti preko linije.'],
      safety: 'Ne testirati po vrućini. Sa mlađim učenicima nastavnik trči u početnim nivoima i drži tempo.',
      sayToStudents: 'Trčiš od linije do linije po zvučnom signalu. Na početku je sporo, a svakog minuta postaje brže. Na svaki signal moraš biti preko linije.',
      source: handbook('16–17, 21'),
    },
  ],
  organization: [
    {
      title: 'Pre testiranja',
      items: [
        'Proveriti da su učenici zdravstveno sposobni i da na dan merenja nisu povređeni.',
        'Testiranje uneti u godišnji plan: početak školske godine (okvirno 20. septembar – 20. oktobar) i kraj (maj).',
        'Učenike dobro zagrejati pre svih testova. Izbegavati rane jutarnje časove za gipkost i snagu, a dane sa visokom temperaturom za šatl ran.',
        'Svaki test demonstrirati i objasniti; grupe formirati od učenika sličnih sposobnosti.',
        'Učenicima objasniti cilj testiranja i vezu između fizičke aktivnosti i zdravlja.',
      ],
    },
    {
      title: 'Primer: tri školska časa',
      items: [
        '1. čas — šatl ran i merenje visine i mase.',
        '2. čas — skok udalj, ležanje-sed za 30 s i izdržaj u zgibu.',
        '3. čas — pretklon u sedu i čunasto trčanje 4 × 10 m (i visina i masa, ako nisu stigle na prvom času).',
        'Druga mogućnost: prvi čas šatl ran i visina i masa, a ostale testove nastavnik radi sa jednom grupom dok druga grupa uvežbava programske sadržaje.',
      ],
    },
    {
      title: 'Učenici kao pomagači',
      items: [
        'Upisuju rezultate u listu sa testiranja.',
        'Kod ležanja-seda drže stopala i broje ponavljanja zajedno sa nastavnikom.',
        'Kod šatl rana stoje na liniji od 20 m, prate „svog" trkača, mere mu vreme (i mobilnim telefonom) i kontrolišu prelazak linije.',
        'Pomažu pri unosu podataka u računar.',
      ],
    },
    {
      title: 'Posle testiranja',
      items: [
        'Učeniku uvek dati povratnu informaciju u odnosu na njegov prethodni rezultat i na kriterijumske referentne vrednosti, uz praktičan savet.',
        'Biti diskretan pri saopštavanju rezultata, naročito mase i visine.',
        'Rezultate ne koristiti za poređenje ni za ocenjivanje učenika — na njih utiču genetika, način života, motivacija i uloženi napor.',
        'Rezultate uneti u portal Zdravitas. Ovlašćeni roditelji vide izveštaje na korisničkom delu portala.',
      ],
    },
  ],
  sources: [
    handbook('9–23'),
    {
      title: 'Softver će obrađivati podatke o fizičkoj spremi đaka (testovi od 3. razreda, dva puta godišnje, bez ocenjivanja)',
      publisher: 'Kurir',
      year: '2022',
      url: 'https://www.kurir.rs/vesti/drustvo/4036458/softver-ce-obradjivati-podatke-o-fizickoj-spremi-djaka-pa-ce-ucitelji-i-nastavnici-odredjivati-vezbe-deci-pasic-to-se-ne-ocenjuje',
    },
    {
      title: 'Obrada podataka maloletnih lica u okviru portala „Zdravitas" (pravni osnov, pristup podacima)',
      publisher: 'Pravni portal',
      year: '2024',
      url: 'https://www.pravniportal.com/?p=40685',
    },
    { title: 'Portal Zdravitas — unos rezultata', publisher: 'Ministarstvo prosvete', year: '', url: 'https://admin.zdravitas.gov.rs/' },
  ],
};

export const ZDRAVITAS_SECONDARY_REFERENCE: ReferenceTable = {
  battery: 'zdravitas',
  title: 'Kriterijumske referentne vrednosti — srednja škola',
  note: 'Za svaki test prikazan je opseg „oko proseka" (zelena zona). Rezultat ispod opsega (za vreme kod 4 × 10 m: sporiji) je u crvenoj zoni — sposobnost treba poboljšati; rezultat iznad opsega (kod 4 × 10 m: brži) je iznad proseka (žuta zona). Donja granica zdravstvene zone je 25. percentil. Za osnovnu školu važe posebne tabele.',
  columns: ['BMI', 'Ležanje-sed (br.)', 'Skok udalj (cm)', 'Šatl ran (s)', 'Pretklon (cm)', '4 × 10 m (s)', 'Izdržaj u zgibu (s)'],
  lowerIsBetter: [false, false, false, false, false, true, false],
  groups: [
    {
      label: 'Mladići',
      rows: [
        { grade: 1, values: [[19.3, 23.6], [21, 28], [175, 215], [240, 430], [15, 27], [12.52, 10.9], [23, 59]] },
        { grade: 2, values: [[19.9, 24.2], [22, 29], [180, 220], [240, 450], [15, 28], [12.2, 10.5], [25, 61]] },
        { grade: 3, values: [[20.6, 24.6], [22, 29], [185, 228], [262, 444], [17, 29], [12.27, 10.5], [27, 63]] },
        { grade: 4, values: [[20.9, 25.4], [22, 28], [190, 228], [259, 450], [16, 27], [12.46, 10.59], [24, 58]] },
      ],
    },
    {
      label: 'Devojke',
      rows: [
        { grade: 1, values: [[19.4, 23.3], [17, 23], [135, 170], [141, 269], [21, 31], [13.87, 12.03], [7, 29]] },
        { grade: 2, values: [[19.5, 23.3], [18, 24], [140, 170], [152, 283], [21, 31], [13.88, 12.19], [10, 30]] },
        { grade: 3, values: [[19.7, 23.5], [18, 24], [135, 170], [150, 265], [21, 31], [13.85, 12.16], [7, 31]] },
        { grade: 4, values: [[19.6, 23.2], [18, 24], [140, 170], [151, 278], [20, 31], [14.05, 12.24], [9, 32]] },
      ],
    },
  ],
  source: handbook('19–20'),
};

const MILANOVIC: TestSource = {
  title: 'Praćenje fizičkog razvoja i razvoja motoričkih sposobnosti učenika u nastavi fizičkog vaspitanja (doktorska disertacija)',
  publisher: 'Ivana Milanović, Fakultet sporta i fizičkog vaspitanja, Univerzitet u Beogradu',
  year: '2011',
  url: 'https://fedorabg.bg.ac.rs/fedora/get/o:8214/bdef:Content/get',
};

const GRUJIC: TestSource = {
  title: 'Razlike u ispoljavanju motoričkih sposobnosti odbojkašica i netreniranih devojčica uzrasta 14 godina (master rad)',
  publisher: 'M. Grujić, Fakultet sporta i fizičkog vaspitanja, Univerzitet u Beogradu',
  year: '2016',
  url: 'https://phaidrabg.bg.ac.rs/open/o:12577',
};

const TEACHER_BLOG: TestSource = {
  title: 'Motoričke sposobnosti — opis testova (nastavnički blog, nezvaničan izvor)',
  publisher: 'Sport za svakoga',
  year: '',
  url: 'https://sportzasvakoga.wordpress.com/motoricke-sposobnosti/',
};

const RAFAILOVIC: TestSource = {
  title: 'Baterija testova za decu uzrasta od 7 do 11 godina (master rad)',
  publisher: 'M. Rafailović, Fakultet sporta i fizičkog vaspitanja, Univerzitet u Beogradu',
  year: '2013',
  url: 'https://fedorabg.bg.ac.rs/fedora/get/o:6284/bdef:Content/get',
};

const sources = (...items: TestSource[]): TestSource => ({
  title: items.map((item) => item.title).join('; '),
  publisher: items.map((item) => item.publisher.split(',')[0] + (item.year ? ' ' + item.year : '')).join('; '),
  year: '',
  url: items[0].url,
  pages: items[0].pages,
});

export const OLD_BATTERY: BatteryGuide = {
  id: 'old',
  tab: 'Stara baterija testova',
  title: 'Stara baterija testova (beogradski model)',
  intro: [
    'Pre nacionalne baterije škole su koristile testove „Sistema stalnog praćenja fizičkog razvoja i fizičkih sposobnosti učenika i učenica osnovnih i srednjih škola Beograda". Sistem je uveden školske 1972/73. godine, stručno ga je vodio Jugoslovenski zavod za fizičku kulturu i medicinu sporta, a testiralo se svake godine u maju. Organizovano praćenje prestalo je devedesetih, ali su mnogi nastavnici i posle toga koristili ove testove i norme.',
    'Školske 1995/96. baterija je izmenjena: izbačeno je odbijanje lopte o zid, a uvedeni su izdržaj u zgibu (najviše 120 s) i pretklon na klupici. Ispod je verzija za uzrast 11–14 godina (5–8. razred) koju većina nastavnika pamti, sa izmenama iz 1995/96.',
    'Zvanični metodološki priručnik ove baterije (S. Ivanić, „Metodologija", Beograd, 1996) nije dostupan na internetu. Opisi ispod su iz stručnih radova Fakulteta sporta i fizičkog vaspitanja i iz školske prakse; gde se izvori razlikuju, navedeno je oba.',
    'Za Zdravitas se ne koriste ovi testovi — tamo se unose rezultati nacionalne baterije. ZUOV napominje da su nastavnici prema starim normama često ocenjivali i poredili učenike, što današnji pristup ne preporučuje.',
  ],
  tests: [
    {
      id: 'sprint-30',
      name: 'Trčanje 30 m',
      measures: 'Brzina',
      picture: 'sprint-30',
      equipment: ['Ravna staza od 30 m sa obeleženom startnom i ciljnom linijom', 'Štoperica'],
      execution: [
        'Učenik stoji u visokom startu iza startne linije (u nekim školskim planovima navodi se niski start).',
        'Na znak trči deonicu od 30 m najbrže što može.',
      ],
      result: 'Vreme od datog znaka do prelaska ciljne linije. Prema master radu FSFV vreme se zaustavlja kad učenik pređe ciljnu liniju punim stopalom; prema nastavničkom opisu — kad grudima pređe vertikalnu ravan iznad ciljne linije. U istraživanju su rađena dva pokušaja sa pauzom od 2 minuta i upisan je bolji.',
      errors: [],
      source: sources(GRUJIC, TEACHER_BLOG),
    },
    {
      id: 'standing-jump-old',
      name: 'Skok udalj iz mesta',
      measures: 'Eksplozivna snaga nogu',
      picture: 'standing-jump',
      equipment: ['Ravna, neklizava površina sa obeleženim skakalištem', 'Mesto odskoka obeleženo trakom', 'Merna traka'],
      execution: [
        'Učenik (prema nastavničkom opisu bos) stoji iza linije, iz počučnja i uz snažan zamah rukama odrazi se sunožno.',
        'Skače što dalje napred i doskoči sunožno.',
      ],
      result: 'Rastojanje od mesta prstiju pri odskoku do mesta peta pri doskoku. U istraživanju su rađena dva skoka i upisan je bolji.',
      errors: [],
      source: sources(GRUJIC, TEACHER_BLOG),
    },
    {
      id: 'medicine-ball',
      name: 'Bacanje medicinke',
      measures: 'Snaga ruku i ramenog pojasa',
      picture: 'medicine-ball',
      equipment: [
        'Medicinka: 1 kg (5–7 godina), 2 kg (7–10 godina), 4 kg (11–14 godina), 6 kg za učenike i 4 kg za učenice (15–19 godina)',
        'Obeležena linija bacanja',
      ],
      execution: [
        'Učenik stoji uspravno iza linije bacanja i drži medicinku obema rukama iznad glave.',
        'Posle laganog uvinuća trupom brzo se pretkloni i baci medicinku što dalje ispred linije.',
      ],
      result: 'Dužina bacanja. Način merenja i broj pokušaja u dostupnim izvorima nisu navedeni.',
      errors: [],
      source: sources(MILANOVIC, TEACHER_BLOG),
    },
    {
      id: 'wall-ball',
      name: 'Odbijanje lopte o zid',
      measures: 'Koordinacija (do 1995/96)',
      picture: 'wall-ball',
      equipment: ['Lopta (prema nastavničkom opisu odbojkaška)', 'Ravan zid i linija obeležena trakom', 'Štoperica'],
      execution: [
        'Učenik stoji iza linije ispred zida — prema master radu FSFV na 3 m, prema nastavničkom opisu na 150 cm.',
        'Na znak baca loptu rukama o zid i hvata je posle odbijanja, što više puta za 15 sekundi.',
      ],
      result: 'Broj uspešno uhvaćenih lopti za 15 s (upisuju se samo uhvaćene lopte). U istraživanju su rađena dva pokušaja i upisan je bolji.',
      errors: [],
      source: sources(GRUJIC, TEACHER_BLOG),
    },
    {
      id: 'mixed-pull-up',
      name: 'Zgib iz visa mešovitog',
      measures: 'Repetitivna snaga ruku i ramenog pojasa (do 1995/96)',
      picture: 'pull-ups',
      equipment: ['Niska pritka ili fiksirana motka'],
      execution: [
        'Učenik visi pothvatom na niskoj pritki, leđima oko 10 cm od tla, sa uglom između trupa i ruku od oko 90°.',
        'Savijanjem ruku podiže telo dok bradom ne dodirne pritku, pa se spušta.',
      ],
      result: 'Test se završava kad učenik više ne može da izvede pravilan zgib. Upisuje se broj pravilnih ponavljanja (jedinica u izvoru nije navedena).',
      errors: [],
      source: TEACHER_BLOG,
    },
    {
      id: 'bench-reach',
      name: 'Pretklon na klupici',
      measures: 'Gipkost (od 1995/96)',
      picture: 'bench-reach',
      equipment: ['Klupica (stepenik)', 'Metar postavljen uz klupicu — početak gore, kraj na podu'],
      execution: ['Učenik stoji na klupici sunožno, pruženih nogu.', 'U pretklonu dohvata metar što dublje može i zadrži krajnji položaj radi očitavanja.'],
      result: 'Dubina dohvata na metru. Dva pokušaja.',
      errors: [],
      source: GRUJIC,
    },
    {
      id: 'endurance-run',
      name: 'Trčanje 800 m (učenici) / 500 m (učenice)',
      measures: 'Izdržljivost',
      picture: 'endurance-run',
      equipment: ['Kružna staza', 'Štoperica'],
      execution: ['Visoki start; na znak startera učenici trče stazom najbrže što mogu — učenici 800 m, učenice 500 m.'],
      result: 'Vreme pretrčane deonice.',
      errors: [],
      safety: 'Učenici moraju biti zdravstveno sposobni i zagrejani; ne trčati po vrućini.',
      source: sources(MILANOVIC, TEACHER_BLOG),
    },
  ],
  organization: [
    {
      title: 'Sastav baterije po uzrastu (do 1995/96)',
      items: [
        '7–10 godina: visina i masa, skok udalj iz mesta, čunasto trčanje 3 × 10 m, bacanje medicinke 2 kg, odbijanje lopte o zid.',
        '11–14 godina: visina i masa, zgib iz visa mešovitog, odbijanje lopte o zid, skok udalj iz mesta, bacanje medicinke 4 kg, trčanje 30 m, trčanje 800 m (učenici) / 500 m (učenice).',
        '15–19 godina: visina i masa, zgib iz visa mešovitog (učenice) / slobodnog (učenici), odbijanje lopte o zid, skok udalj, bacanje medicinke 6 kg (učenici) / 4 kg (učenice), trčanje 30 m, 800 m / 500 m.',
      ],
    },
    {
      title: 'Sastav baterije po uzrastu (od 1995/96)',
      items: [
        '5–7 i 7–10 godina: visina i masa, skok udalj iz mesta, izdržaj u zgibu (najviše 120 s), bacanje medicinke (1 kg, odnosno 2 kg), pretklon na klupici, trčanje 30 m iz visokog starta.',
        '11–14 godina: izdržaj u zgibu (najviše 120 s), pretklon na klupici, skok udalj, bacanje medicinke 4 kg, trčanje 30 m iz visokog starta, 800 m / 500 m.',
        '15–19 godina: izdržaj u zgibu, pretklon na klupici, skok udalj, bacanje medicinke 6 kg / 4 kg, trčanje 30 m, 800 m / 500 m.',
        'Izvori se za verziju iz 1995/96. delimično razlikuju (npr. vrsta starta na 30 m kod najmlađih); tabela je prema disertaciji I. Milanović (2011, str. 51).',
      ],
    },
    {
      title: 'Kada se testiralo',
      items: [
        'U beogradskom sistemu — svake godine u maju.',
        'U školskoj praksi i kasnije: na početku (septembar) i na kraju školske godine (maj–jun), npr. u paru po času: skok udalj i medicinka; 30 m i odbijanje lopte o zid; zgib i masa; 800 / 500 m i visina.',
      ],
    },
    {
      title: 'Danas',
      items: [
        'Od školske 2017/18. zvanična je nacionalna baterija (Prosvetni glasnik 6/2017), a rezultati se unose u Zdravitas.',
        'Stari testovi mogu da posluže kao vežbe i za praćenje napretka na času, ali ne zamenjuju nacionalnu bateriju i ne služe za ocenu.',
      ],
    },
  ],
  sources: [
    { ...MILANOVIC, pages: '32, 48–51' },
    { ...RAFAILOVIC, pages: '51–52' },
    { ...GRUJIC, pages: '19–21' },
    TEACHER_BLOG,
    {
      title: 'Raspored programskih sadržaja po časovima, 7. razred (primer rasporeda testiranja, nezvaničan izvor)',
      publisher: 'Nastavnički blog',
      year: '2013',
      url: 'https://sasadjordj.wordpress.com/2013/03/24/распоред-програмских-садржаја-по-час/',
    },
    {
      title: 'Pravilnik o izmenama i dopunama nastavnog programa za peti razred (uvodi nacionalnu bateriju)',
      publisher: 'Prosvetni glasnik 6/2017',
      year: '2017',
      url: 'https://www.paragraf.rs/izmene_i_dopune/060717-pravilnik_o_izmenama_i_dopunama_pravilnika_o_nastavnom_planu_za_drugi_ciklus_osnovnog_obrazovanja_i_vaspitanja_i_nastavnom_programu_za_peti_razred_osnovnog_obrazovanja_i_vaspitanja.html',
    },
    handbook('4'),
  ],
};

export const BATTERIES: BatteryGuide[] = [ZDRAVITAS_BATTERY, OLD_BATTERY];

export const REFERENCE_TABLES: ReferenceTable[] = [ZDRAVITAS_SECONDARY_REFERENCE];

export const TESTING_SOURCES: TestSource[] = [ZUOV_HANDBOOK, MILANOVIC, GRUJIC, TEACHER_BLOG, RAFAILOVIC];
