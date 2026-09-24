import { parameterizeSql } from './sql-parameterizer-logic';

describe('parameterizeSql', () => {
  it('replaces literals with "?" placeholders and extracts their values in order', () => {
    const result = parameterizeSql("SELECT * FROM t WHERE x = 1 AND y = 'hello'", 'postgresql', 'question');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.sql).toBe('SELECT * FROM "t" WHERE x = ? AND y = ?');
    expect(result.values).toEqual([1, 'hello']);
  });

  it('replaces literals with numbered "$n" placeholders', () => {
    const result = parameterizeSql("SELECT * FROM t WHERE x = 1 AND y = 'hello'", 'postgresql', 'dollar');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.sql).toBe('SELECT * FROM "t" WHERE x = $1 AND y = $2');
  });

  it('replaces literals with named ":pN" placeholders', () => {
    const result = parameterizeSql('SELECT * FROM t WHERE x = 1', 'postgresql', 'named');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.sql).toBe('SELECT * FROM "t" WHERE x = :p1');
  });

  it('does not parameterize a NULL literal', () => {
    const result = parameterizeSql('SELECT * FROM t WHERE a IS NULL', 'postgresql', 'question');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.values).toEqual([]);
      expect(result.sql).toContain('IS NULL');
    }
  });

  it('rejects empty input', () => {
    expect(parameterizeSql('', 'postgresql', 'question').ok).toBe(false);
  });

  it('rejects invalid SQL', () => {
    expect(parameterizeSql('SELECT FROM WHERE', 'postgresql', 'question').ok).toBe(false);
  });
});
