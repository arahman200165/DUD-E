/**
 * Pure, framework-free timestamp conversion used by the Unix Timestamp tool.
 */

export type TimestampUnit = 'auto' | 'seconds' | 'milliseconds';
export type DisplayTimezone = 'local' | 'utc';

export type TimestampParseResult =
  | { readonly ok: true; readonly date: Date; readonly resolvedUnit: 'seconds' | 'milliseconds' }
  | { readonly ok: false; readonly error: string };

export type TimestampNumberResult = { readonly ok: true; readonly value: number } | { readonly ok: false; readonly error: string };

/** Digit-length heuristic: 13+ digits is almost certainly milliseconds (seconds hits 13 digits in the year 2286). */
export function resolveUnit(rawValue: string, unit: TimestampUnit): 'seconds' | 'milliseconds' | null {
  if (unit !== 'auto') return unit;
  const digits = rawValue.replace(/[^0-9]/g, '').length;
  if (digits === 0) return null;
  return digits >= 13 ? 'milliseconds' : 'seconds';
}

export function parseTimestamp(rawValue: string, unit: TimestampUnit): TimestampParseResult {
  const trimmed = rawValue.trim();
  if (trimmed === '') return { ok: false, error: 'Enter a timestamp.' };
  if (!/^-?\d+$/.test(trimmed)) return { ok: false, error: 'Timestamp must be an integer.' };

  const resolvedUnit = resolveUnit(trimmed, unit);
  if (!resolvedUnit) return { ok: false, error: 'Enter a timestamp.' };

  const numeric = Number(trimmed);
  const ms = resolvedUnit === 'seconds' ? numeric * 1000 : numeric;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return { ok: false, error: 'Timestamp is out of range.' };

  return { ok: true, date, resolvedUnit };
}

export function dateToTimestamp(
  dateTimeLocalValue: string,
  tz: DisplayTimezone,
  unit: 'seconds' | 'milliseconds',
): TimestampNumberResult {
  if (dateTimeLocalValue.trim() === '') return { ok: false, error: 'Enter a date and time.' };

  const isoCandidate = tz === 'utc' ? `${dateTimeLocalValue}Z` : dateTimeLocalValue;
  const date = new Date(isoCandidate);
  if (Number.isNaN(date.getTime())) return { ok: false, error: 'Invalid date/time.' };

  const ms = date.getTime();
  return { ok: true, value: unit === 'seconds' ? Math.floor(ms / 1000) : ms };
}

export function formatDate(date: Date, tz: DisplayTimezone): string {
  return tz === 'utc' ? date.toISOString() : date.toString();
}

export function toDateTimeLocalValue(date: Date, tz: DisplayTimezone): string {
  if (tz === 'utc') return date.toISOString().slice(0, 19);

  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
