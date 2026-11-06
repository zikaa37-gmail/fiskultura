import { RULE_HISTORY } from './rule-history';
import { RULE_TOPICS, reviewDue } from './rule-topics';
import { CONTACTS_CHECKED_AT, INSTITUTION_CONTACTS, SCHOOL_ADMINISTRATIONS, telHref } from './contacts';

describe('Šta važi: teme, istorija i kontakti', () => {
  it('teme imaju jedinstven slug, datum provere, propise i vremensku liniju od novijeg ka starijem', () => {
    expect(new Set(RULE_TOPICS.map((topic) => topic.slug)).size).toBe(RULE_TOPICS.length);
    for (const topic of RULE_TOPICS) {
      expect(topic.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(topic.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(topic.regulations.length, topic.slug).toBeGreaterThan(0);
      expect(topic.previous.length, topic.slug).toBeGreaterThan(0);
      const years = topic.timeline.map((step) => Number(step.date.slice(0, 4)));
      expect([...years].sort((a, b) => b - a), topic.slug).toEqual(years);
    }
    for (const era of RULE_HISTORY) {
      for (const slug of era.topics) {
        expect(RULE_TOPICS.some((topic) => topic.slug === slug), slug).toBe(true);
      }
    }
  });

  it('rok provere: šest meseci, a leti pre nove školske godine i ranije', () => {
    expect(reviewDue('2026-11-06', new Date(2026, 11, 1))).toBe(false);
    expect(reviewDue('2026-11-06', new Date(2027, 4, 7))).toBe(true);
    expect(reviewDue('2027-03-01', new Date(2027, 6, 15))).toBe(true);
    expect(reviewDue('2027-06-20', new Date(2027, 7, 1))).toBe(false);
  });

  it('kontakti imaju zvaničan link i ispravne brojeve za poziv', () => {
    expect(CONTACTS_CHECKED_AT).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const institution of INSTITUTION_CONTACTS) {
      expect(institution.url).toMatch(/^https:\/\//);
    }
    expect(SCHOOL_ADMINISTRATIONS.length).toBe(18);
    expect(telHref('011/3613-734')).toBe('tel:+381113613734');
  });
});
