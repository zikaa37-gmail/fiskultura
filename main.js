(function () {
  const exercises = [
    {
      name: 'Čučanj uz zid',
      meta: 'Noge · bez opreme · 5–8 razred',
      description: 'Jača butine i zadnjicu, uči pravilan položaj kolena.',
      steps: [
        'Leđa naslonjena na zid, stopala u širini kukova, pola koraka od zida.',
        'Spusti se dok kolena ne budu pod pravim uglom, kolena iznad članaka.',
        'Zadrži 20–30 sekundi, odmori 30 sekundi. Ponovi 3 puta.',
      ],
    },
    {
      name: 'Plank na podlakticama',
      meta: 'Trup · strunjača · 3–8 razred',
      description: 'Jača mišiće trupa koji drže pravilno držanje tela.',
      steps: [
        'Podlaktice na podu, laktovi ispod ramena.',
        'Telo u pravoj liniji od glave do peta, pogled u pod.',
        'Zadrži 15–40 sekundi bez spuštanja kukova. Ponovi 3 puta.',
      ],
    },
    {
      name: 'Skokovi preko linije',
      meta: 'Brzina i koordinacija · bez opreme · 1–8 razred',
      description: 'Zagrevanje koje podiže puls i uči brzu promenu pravca.',
      steps: [
        'Stani bočno pored linije na podu sale.',
        'Sunožno skači levo-desno preko linije, što brže i niže.',
        '3 serije po 20 sekundi, između serija 40 sekundi hoda.',
      ],
    },
    {
      name: 'Most na leđima',
      meta: 'Zadnja loža i leđa · strunjača · 3–8 razred',
      description: 'Jača zadnji lanac mišića i rasterećuje donja leđa.',
      steps: [
        'Lezi na leđa, kolena savijena, stopala na podu u širini kukova.',
        'Podigni kukove dok telo od ramena do kolena ne bude prava linija.',
        'Zadrži 2 sekunde gore, polako spusti. 3 serije po 10 ponavljanja.',
      ],
    },
    {
      name: 'Pretklon u sedu',
      meta: 'Gipkost · strunjača · 1–8 razred',
      description: 'Istezanje zadnje strane nogu za završni deo časa.',
      steps: [
        'Sedi, noge opružene i spojene, stopala ka plafonu.',
        'Sa izdahom polako kreni rukama ka prstima, bez trzanja.',
        'Zadrži 20–30 sekundi u položaju blagog istezanja. Ponovi 2 puta.',
      ],
    },
  ];

  const dayIndex = Math.floor(Date.now() / 86400000) % exercises.length;
  let current = dayIndex;

  const nameNode = document.querySelector('[data-exercise-name]');
  const metaNode = document.querySelector('[data-exercise-meta]');
  const descriptionNode = document.querySelector('[data-exercise-description]');
  const stepsNode = document.querySelector('[data-exercise-steps]');
  const nextButton = document.querySelector('[data-exercise-next]');

  function render() {
    const exercise = exercises[current];
    nameNode.textContent = exercise.name;
    metaNode.textContent = exercise.meta;
    descriptionNode.textContent = exercise.description;
    stepsNode.replaceChildren(
      ...exercise.steps.map((step) => {
        const item = document.createElement('li');
        item.textContent = step;
        return item;
      }),
    );
  }

  if (nameNode) {
    render();
    nextButton.addEventListener('click', () => {
      current = (current + 1) % exercises.length;
      render();
    });
  }

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
