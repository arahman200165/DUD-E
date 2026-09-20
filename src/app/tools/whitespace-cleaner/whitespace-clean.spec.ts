import { WhitespaceCleanOptions, cleanWhitespace } from './whitespace-clean';

const NONE: WhitespaceCleanOptions = {
  trim: false,
  collapseSpaces: false,
  normalizeLineEndings: false,
  stripTrailingWhitespace: false,
  removeBlankLines: false,
  stripInvisibleChars: false,
  tabConversion: 'none',
  tabWidth: 4,
};

describe('cleanWhitespace', () => {
  it('returns the input unchanged when every option is disabled', () => {
    expect(cleanWhitespace('  a  \r\n\tb\t \n', NONE)).toBe('  a  \r\n\tb\t \n');
  });

  it('trims leading and trailing whitespace of the whole text', () => {
    expect(cleanWhitespace('  hello  ', { ...NONE, trim: true })).toBe('hello');
  });

  it('collapses repeated spaces and tabs within a line', () => {
    expect(cleanWhitespace('a    b\t\tc', { ...NONE, collapseSpaces: true })).toBe('a b c');
  });

  it('normalizes CRLF and lone CR to LF', () => {
    expect(cleanWhitespace('a\r\nb\rc\nd', { ...NONE, normalizeLineEndings: true })).toBe('a\nb\nc\nd');
  });

  it('strips trailing whitespace per line', () => {
    expect(cleanWhitespace('a  \nb\t\nc', { ...NONE, stripTrailingWhitespace: true })).toBe('a\nb\nc');
  });

  it('removes blank lines', () => {
    expect(cleanWhitespace('a\n\n  \nb', { ...NONE, removeBlankLines: true })).toBe('a\nb');
  });

  it('strips zero-width and invisible characters', () => {
    expect(cleanWhitespace('a​b﻿c', { ...NONE, stripInvisibleChars: true })).toBe('abc');
  });

  it('converts tabs to spaces using the configured width', () => {
    expect(cleanWhitespace('a\tb', { ...NONE, tabConversion: 'tabs-to-spaces', tabWidth: 2 })).toBe('a  b');
  });

  it('converts runs of spaces to tabs using the configured width', () => {
    expect(cleanWhitespace('a  b', { ...NONE, tabConversion: 'spaces-to-tabs', tabWidth: 2 })).toBe('a\tb');
  });

  it('applies multiple operations together', () => {
    const result = cleanWhitespace('  foo   bar  \r\n\r\n  baz  \n', {
      ...NONE,
      trim: true,
      collapseSpaces: true,
      normalizeLineEndings: true,
      stripTrailingWhitespace: true,
      removeBlankLines: true,
    });
    expect(result).toBe('foo bar\n baz');
  });

  it('handles empty input', () => {
    expect(cleanWhitespace('', { ...NONE, trim: true, collapseSpaces: true })).toBe('');
  });
});
