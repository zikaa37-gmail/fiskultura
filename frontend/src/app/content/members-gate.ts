export type GateSection = 'sportovi' | 'propisi' | 'pitanja' | 'debate';

export interface GateContent {
  title: string;
  intro: string;
  topics: string[];
  path: string;
}

export const MEMBERS_GATE: Record<GateSection, GateContent> = {
  sportovi: {
    title: 'Sportovi i pravila za čas',
    intro: 'Pravila sportova za decu sa sličicama, kratki kvizovi, PDF uputstva za čas, testiranje fizičkih sposobnosti i školski kros.',
    topics: ['Košarka', 'Odbojka', 'Rukomet', 'Mali fudbal', 'Atletika', 'Gimnastika', 'Elementarne igre', 'Plesovi', 'Testiranje', 'Kros'],
    path: '/sportovi',
  },
  propisi: {
    title: 'Šta važi u nastavi fizičkog',
    intro: 'Fond časova, programi i ishodi, šta se menja i od kada, jednostavnim rečima i sa linkom na tačan član propisa. Uz to kontakti institucija.',
    topics: ['Fond časova', 'Programi i ishodi', 'Ocenjivanje', 'Oslobađanje od nastave', 'Šta se menja', 'Kome se obratiti'],
    path: '/propisi',
  },
  pitanja: {
    title: 'Pitanja i odgovori',
    intro: 'Odgovori uredništva na pitanja kolega, uvek uz poziv na propis. Kao član možeš i sam da postaviš pitanje.',
    topics: ['Norma', 'Ocenjivanje', 'Oslobađanje', 'Bezbednost na času', 'Takmičenja', 'Dežurstva'],
    path: '/pitanja',
  },
  debate: {
    title: 'Debate nastavnika fizičkog',
    intro: 'Teme o kojima struka razgovara: svako može da pita, kritikuje, predloži i lajkuje, a moderator objavljuje sažetak rasprave za one koji nemaju vremena da čitaju sve.',
    topics: ['Norma i sekcije', 'Ocenjivanje', 'Oprema i sala', 'Takmičenja', 'Programi', 'Predlozi struke'],
    path: '/debate',
  },
};
