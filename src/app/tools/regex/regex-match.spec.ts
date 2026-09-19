import { findMatches } from './regex-match';

describe('findMatches', () => {
  it('rejects an empty pattern', () => {
    expect(findMatches('', '', 'text').ok).toBe(false);
  });

  it('reports a syntax error for an invalid pattern', () => {
    const result = findMatches('(unclosed', '', 'text');
    expect(result.ok).toBe(false);
  });

  it('finds all matches of a simple pattern', () => {
    const result = findMatches('cat', '', 'cat sat cat mat');

    expect(result.ok).toBe(true);
    expect(result.ok && result.matches.map((m) => m.index)).toEqual([0, 8]);
  });

  it('is case-insensitive with the i flag', () => {
    const result = findMatches('cat', 'i', 'CAT cat');

    expect(result.ok).toBe(true);
    expect(result.ok && result.matches).toHaveLength(2);
  });

  it('captures numbered groups', () => {
    const result = findMatches('(\\d+)-(\\d+)', '', '10-20');

    expect(result.ok).toBe(true);
    expect(result.ok && result.matches[0].groups).toEqual([
      { index: 1, value: '10' },
      { index: 2, value: '20' },
    ]);
  });

  it('captures named groups', () => {
    const result = findMatches('(?<year>\\d{4})-(?<month>\\d{2})', '', '2024-01');

    expect(result.ok).toBe(true);
    const named = (result.ok ? result.matches[0].groups : []).filter((g) => g.name);
    expect(named).toEqual([
      { index: -1, name: 'year', value: '2024' },
      { index: -1, name: 'month', value: '01' },
    ]);
  });

  it('does not loop forever on a pattern that can match zero-length', () => {
    const result = findMatches('a*', '', 'bbb');
    expect(result.ok).toBe(true);
  });

  it('returns an empty match list when there is no match', () => {
    const result = findMatches('xyz', '', 'abc');
    expect(result).toEqual({ ok: true, matches: [] });
  });

  it('caps zero-length matches at MAX_MATCHES instead of matching every position', () => {
    const result = findMatches('a*', '', 'b'.repeat(20_000));

    expect(result.ok).toBe(true);
    expect(result.ok && result.matches).toHaveLength(10_000);
  });
});
