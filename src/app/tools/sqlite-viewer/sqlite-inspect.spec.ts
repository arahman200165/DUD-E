import initSqlJs from 'sql.js';
import { inspectSqlite } from './sqlite-inspect';

async function buildSampleDatabase(): Promise<Uint8Array> {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run('CREATE TABLE users (id INTEGER, name TEXT); INSERT INTO users VALUES (1, \'Alice\'), (2, \'Bob\');');
  db.run('CREATE TABLE tags (label TEXT);');
  const bytes = db.export();
  db.close();
  return bytes;
}

describe('inspectSqlite', () => {
  it('lists every table with its columns and rows', async () => {
    const bytes = await buildSampleDatabase();

    const result = await inspectSqlite(bytes);

    expect(result).toEqual({
      ok: true,
      tables: [
        {
          name: 'tags',
          columns: [],
          rows: [],
        },
        {
          name: 'users',
          columns: ['id', 'name'],
          rows: [
            ['1', 'Alice'],
            ['2', 'Bob'],
          ],
        },
      ],
    });
  });

  it('rejects an empty file', async () => {
    expect((await inspectSqlite(new Uint8Array(0))).ok).toBe(false);
  });

  it('reports an error for bytes that are not a valid SQLite file', async () => {
    const result = await inspectSqlite(new Uint8Array([1, 2, 3, 4, 5]));

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.message.length > 0).toBe(true);
  });
});
