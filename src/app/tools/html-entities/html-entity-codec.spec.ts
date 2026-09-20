import { decodeHtmlEntities, encodeHtmlEntities } from './html-entity-codec';

describe('decodeHtmlEntities', () => {
  it('decodes named entities', () => {
    expect(decodeHtmlEntities('&amp;&lt;&gt;&quot;')).toBe('&<>"');
  });

  it('decodes decimal numeric entities', () => {
    expect(decodeHtmlEntities('&#39;')).toBe("'");
  });

  it('decodes hexadecimal numeric entities', () => {
    expect(decodeHtmlEntities('&#x27;')).toBe("'");
  });

  it('decodes accented-letter named entities', () => {
    expect(decodeHtmlEntities('Caf&eacute;')).toBe('Café');
  });

  it('leaves plain text unchanged', () => {
    expect(decodeHtmlEntities('hello world')).toBe('hello world');
  });

  it('handles empty input', () => {
    expect(decodeHtmlEntities('')).toBe('');
  });
});

describe('encodeHtmlEntities', () => {
  it('escapes &, <, and >', () => {
    expect(encodeHtmlEntities('<b>a & b</b>', false)).toBe('&lt;b&gt;a &amp; b&lt;/b&gt;');
  });

  it('leaves quotes untouched in text content', () => {
    expect(encodeHtmlEntities('say "hi"', false)).toBe('say "hi"');
  });

  it('leaves non-ASCII characters untouched by default', () => {
    expect(encodeHtmlEntities('café', false)).toBe('café');
  });

  it('encodes non-ASCII characters as numeric entities when requested', () => {
    expect(encodeHtmlEntities('café', true)).toBe('caf&#233;');
  });

  it('round-trips through decode', () => {
    const original = '<div class="a">Tom & Jerry</div>';
    expect(decodeHtmlEntities(encodeHtmlEntities(original, false))).toBe(original);
  });

  it('handles empty input', () => {
    expect(encodeHtmlEntities('', false)).toBe('');
  });
});
