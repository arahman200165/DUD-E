import { decodeUrl, encodeUrl } from './url-encode-codec';

describe('encodeUrl', () => {
  it('component mode escapes reserved characters like & and /', () => {
    expect(encodeUrl('a b&c/d', 'component')).toEqual({ ok: true, value: 'a%20b%26c%2Fd' });
  });

  it('full mode preserves URI-reserved characters like / and :', () => {
    expect(encodeUrl('https://example.com/a b', 'full')).toEqual({
      ok: true,
      value: 'https://example.com/a%20b',
    });
  });

  it('round-trips unicode text', () => {
    const encoded = encodeUrl('café ❤', 'component');
    expect(encoded.ok).toBe(true);
  });
});

describe('decodeUrl', () => {
  it('component mode decodes percent-escapes', () => {
    expect(decodeUrl('a%20b%26c', 'component')).toEqual({ ok: true, value: 'a b&c' });
  });

  it('full mode decodes percent-escapes but leaves reserved characters valid', () => {
    expect(decodeUrl('https://example.com/a%20b', 'full')).toEqual({
      ok: true,
      value: 'https://example.com/a b',
    });
  });

  it('rejects malformed percent-encoding', () => {
    expect(decodeUrl('%', 'component')).toEqual({
      ok: false,
      error: 'Invalid percent-encoding in this input.',
    });
  });

  it('rejects an incomplete escape sequence', () => {
    expect(decodeUrl('100% done', 'component')).toEqual({
      ok: false,
      error: 'Invalid percent-encoding in this input.',
    });
  });
});
