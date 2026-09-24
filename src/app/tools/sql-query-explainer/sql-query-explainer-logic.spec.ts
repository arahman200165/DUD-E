import { explainSqlQuery } from './sql-query-explainer-logic';

describe('explainSqlQuery', () => {
  it('explains a simple SELECT with a WHERE clause', () => {
    const result = explainSqlQuery('SELECT a, b FROM t WHERE x = 1', 'postgresql');
    expect(result).toEqual({
      ok: true,
      lines: ['Selects: a, b.', 'From: t.', 'Filters rows where: x = 1.'],
    });
  });

  it('explains SELECT *', () => {
    const result = explainSqlQuery('SELECT * FROM t', 'postgresql');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.lines[0]).toBe('Selects all columns (*).');
  });

  it('explains a full query with JOIN, GROUP BY, HAVING, ORDER BY, and LIMIT', () => {
    const result = explainSqlQuery(
      'SELECT a, COUNT(b) AS cnt FROM t1 JOIN t2 ON t1.id = t2.t1_id WHERE t1.x > 5 GROUP BY a HAVING COUNT(b) > 1 ORDER BY a DESC LIMIT 10',
      'postgresql',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lines).toEqual([
      'Selects: a, COUNT(b) (as cnt).',
      'From: t1.',
      'INNER JOIN t2 on "t1".id = "t2".t1_id.',
      'Filters rows where: "t1".x > 5.',
      'Groups by: a.',
      'Filters groups where: COUNT(b) > 1.',
      'Orders by: a DESC.',
      'Limits the result to 10 row(s).',
    ]);
  });

  it('rejects a non-SELECT statement', () => {
    const result = explainSqlQuery('DELETE FROM t WHERE x = 1', 'postgresql');
    expect(result.ok).toBe(false);
  });

  it('rejects empty input', () => {
    expect(explainSqlQuery('', 'postgresql').ok).toBe(false);
  });

  it('rejects invalid SQL', () => {
    expect(explainSqlQuery('SELECT FROM WHERE', 'postgresql').ok).toBe(false);
  });
});
