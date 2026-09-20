export type TabConversion = 'none' | 'tabs-to-spaces' | 'spaces-to-tabs';

export interface WhitespaceCleanOptions {
  readonly trim: boolean;
  readonly collapseSpaces: boolean;
  readonly normalizeLineEndings: boolean;
  readonly stripTrailingWhitespace: boolean;
  readonly removeBlankLines: boolean;
  readonly stripInvisibleChars: boolean;
  readonly tabConversion: TabConversion;
  readonly tabWidth: number;
}

export const DEFAULT_WHITESPACE_OPTIONS: WhitespaceCleanOptions = {
  trim: true,
  collapseSpaces: true,
  normalizeLineEndings: true,
  stripTrailingWhitespace: true,
  removeBlankLines: false,
  stripInvisibleChars: false,
  tabConversion: 'none',
  tabWidth: 4,
};

/** Zero-width space, ZWNJ, ZWJ, BOM/ZWNBSP, soft hyphen, word joiner. */
const INVISIBLE_CHAR_PATTERN = /[​-‍﻿­⁠]/g;

export function cleanWhitespace(input: string, options: WhitespaceCleanOptions): string {
  let text = input;

  if (options.normalizeLineEndings) {
    text = text.replace(/\r\n?/g, '\n');
  }

  if (options.stripInvisibleChars) {
    text = text.replace(INVISIBLE_CHAR_PATTERN, '');
  }

  if (options.collapseSpaces) {
    text = mapLines(text, (line) => line.replace(/[ \t]+/g, ' '));
  }

  const tabWidth = Math.max(1, Math.trunc(options.tabWidth) || 1);
  if (options.tabConversion === 'tabs-to-spaces') {
    text = text.replace(/\t/g, ' '.repeat(tabWidth));
  } else if (options.tabConversion === 'spaces-to-tabs') {
    const run = ' '.repeat(tabWidth);
    text = mapLines(text, (line) => line.split(run).join('\t'));
  }

  if (options.stripTrailingWhitespace) {
    text = mapLines(text, (line) => line.replace(/[ \t]+$/, ''));
  }

  if (options.removeBlankLines) {
    text = text
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join('\n');
  }

  if (options.trim) {
    text = text.trim();
  }

  return text;
}

function mapLines(text: string, fn: (line: string) => string): string {
  return text.split('\n').map(fn).join('\n');
}
