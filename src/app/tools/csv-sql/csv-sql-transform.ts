/**
 * Pure, framework-free CSV <-> SQL INSERT conversion used by the CSV <-> SQL
 * Converter tool. Shared as-is between the main thread (small inputs) and
 * `csv-sql.worker.ts` (large inputs).
 */

import Papa from 'papaparse';

export type CsvSqlDirection = 'csv-to-sql' | 'sql-to-csv';

export interface CsvSqlError {
  readonly message: string;
}

export type CsvSqlResult = { readonly ok: true; readonly output: string } | { readonly ok: false; readonly error: CsvSqlError };

const NUMERIC = /^-?\d+(\.\d+)?$/;

/** Exported for reuse by Mock Data Studio's SQL export and CSV/JSON-to-INSERT conversion. */
export function sqlValue(value: string): string {
  if (value === '') return 'NULL';
  if (NUMERIC.test(value)) return value;
  return `'${value.replace(/'/g, "''")}'`;
}

function csvToSql(input: string, tableName: string): CsvSqlResult {
  if (input.trim() === '') return { ok: false, error: { message: 'Enter some CSV.' } };

  const parsed = Papa.parse<string[]>(input, { delimiter: ',', skipEmptyLines: true });
  if (parsed.errors.length > 0) return { ok: false, error: { message: parsed.errors[0].message } };
  if (parsed.data.length === 0) return { ok: false, error: { message: 'No rows found.' } };

  const [header, ...rows] = parsed.data;
  if (rows.length === 0) return { ok: false, error: { message: 'No data rows found below the header.' } };

  const columnList = header.join(', ');
  const statements = rows.map((row) => {
    const values = header.map((_, index) => sqlValue(row[index] ?? ''));
    return `INSERT INTO ${tableName} (${columnList}) VALUES (${values.join(', ')});`;
  });

  return { ok: true, output: statements.join('\n') };
}

/** Splits a SQL value list on top-level commas, respecting '...'-quoted strings with ''-escaped quotes. */
function splitValues(text: string): string[] {
  const values: string[] = [];
  let current = '';
  let inString = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (char === "'" && text[i + 1] === "'") {
        current += "''";
        i++;
      } else if (char === "'") {
        inString = false;
        current += char;
      } else {
        current += char;
      }
    } else if (char === "'") {
      inString = true;
      current += char;
    } else if (char === ',') {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function unquoteSqlValue(value: string): string {
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (value.toUpperCase() === 'NULL') return '';
  return value;
}

const INSERT_RE = /INSERT\s+INTO\s+\S+\s*\(([^)]*)\)\s*VALUES\s*\(([^;]*)\)\s*;?/gis;

function sqlToCsv(input: string): CsvSqlResult {
  if (input.trim() === '') return { ok: false, error: { message: 'Enter some SQL INSERT statements.' } };

  const statements = [...input.matchAll(INSERT_RE)];
  if (statements.length === 0) {
    return { ok: false, error: { message: 'No INSERT INTO ... VALUES (...) statements found.' } };
  }

  const columns = statements[0][1].split(',').map((column) => column.trim());
  const rows = statements.map((match) => splitValues(match[2]).map(unquoteSqlValue));

  const output = Papa.unparse([columns, ...rows], { newline: '\n' });
  return { ok: true, output };
}

export function convertCsvSql(input: string, direction: CsvSqlDirection, tableName: string): CsvSqlResult {
  return direction === 'csv-to-sql' ? csvToSql(input, tableName || 'table') : sqlToCsv(input);
}
