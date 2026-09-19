import { dateToTimestamp, formatDate, parseTimestamp, resolveUnit, toDateTimeLocalValue } from './timestamp-convert';

describe('resolveUnit', () => {
  it('auto-detects seconds for a 10-digit value', () => {
    expect(resolveUnit('1700000000', 'auto')).toBe('seconds');
  });

  it('auto-detects milliseconds for a 13-digit value', () => {
    expect(resolveUnit('1700000000000', 'auto')).toBe('milliseconds');
  });

  it('respects an explicit unit override regardless of digit count', () => {
    expect(resolveUnit('1700000000000', 'seconds')).toBe('seconds');
  });

  it('returns null for an empty value', () => {
    expect(resolveUnit('', 'auto')).toBeNull();
  });
});

describe('parseTimestamp', () => {
  it('parses a valid seconds timestamp', () => {
    const result = parseTimestamp('1700000000', 'auto');

    expect(result.ok).toBe(true);
    expect(result.ok && result.resolvedUnit).toBe('seconds');
    expect(result.ok && result.date.getTime()).toBe(1_700_000_000_000);
  });

  it('parses a valid milliseconds timestamp', () => {
    const result = parseTimestamp('1700000000000', 'auto');

    expect(result.ok).toBe(true);
    expect(result.ok && result.resolvedUnit).toBe('milliseconds');
  });

  it('rejects non-integer input', () => {
    expect(parseTimestamp('not-a-number', 'auto').ok).toBe(false);
  });

  it('rejects empty input', () => {
    expect(parseTimestamp('', 'auto').ok).toBe(false);
  });
});

describe('dateToTimestamp', () => {
  it('converts a UTC date/time string to a seconds timestamp', () => {
    expect(dateToTimestamp('2023-11-14T22:13:20', 'utc', 'seconds')).toEqual({ ok: true, value: 1_700_000_000 });
  });

  it('converts a UTC date/time string to a milliseconds timestamp', () => {
    expect(dateToTimestamp('2023-11-14T22:13:20', 'utc', 'milliseconds')).toEqual({
      ok: true,
      value: 1_700_000_000_000,
    });
  });

  it('rejects an empty value', () => {
    expect(dateToTimestamp('', 'utc', 'seconds').ok).toBe(false);
  });

  it('rejects an unparseable date/time', () => {
    expect(dateToTimestamp('not-a-date', 'utc', 'seconds').ok).toBe(false);
  });
});

describe('formatDate', () => {
  it('formats as ISO 8601 for UTC', () => {
    expect(formatDate(new Date(1_700_000_000_000), 'utc')).toBe('2023-11-14T22:13:20.000Z');
  });
});

describe('toDateTimeLocalValue', () => {
  it('formats a UTC date as a datetime-local value', () => {
    expect(toDateTimeLocalValue(new Date(1_700_000_000_000), 'utc')).toBe('2023-11-14T22:13:20');
  });
});
