import { pageItems } from './pagination';

describe('pageItems', () => {
  it('shows all pages when there are few', () => {
    expect(pageItems(1, 3)).toEqual([1, 2, 3]);
    expect(pageItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('uses gaps around the current page', () => {
    expect(pageItems(1, 12)).toEqual([1, 2, 0, 12]);
    expect(pageItems(6, 12)).toEqual([1, 0, 5, 6, 7, 0, 12]);
    expect(pageItems(12, 12)).toEqual([1, 0, 11, 12]);
  });

  it('fills a single missing page instead of a gap', () => {
    expect(pageItems(4, 12)).toEqual([1, 2, 3, 4, 5, 0, 12]);
  });
});
