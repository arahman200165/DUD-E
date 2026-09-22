import { describe, expect, it } from 'vitest';
import { convertHexText } from './hex-text-convert';

describe('convertHexText', () => {
  it('encodes ASCII text to hex and back', () => {
    const toHex = convertHexText('Hi!', 'toHex', 'ascii');
    expect(toHex).toEqual({ ok: true, value: '486921' });

    const toText = convertHexText('486921', 'toText', 'ascii');
    expect(toText).toEqual({ ok: true, value: 'Hi!' });
  });

  it('round-trips UTF-8 multi-byte characters', () => {
    const toHex = convertHexText('café', 'toHex', 'utf8');
    expect(toHex.ok).toBe(true);
    const toText = toHex.ok ? convertHexText(toHex.value, 'toText', 'utf8') : null;
    expect(toText).toEqual({ ok: true, value: 'café' });
  });

  it('round-trips through UTF-16LE and UTF-16BE', () => {
    const le = convertHexText('AB', 'toHex', 'utf16le');
    expect(le).toEqual({ ok: true, value: '41004200' });
    expect(convertHexText('41004200', 'toText', 'utf16le')).toEqual({ ok: true, value: 'AB' });

    const be = convertHexText('AB', 'toHex', 'utf16be');
    expect(be).toEqual({ ok: true, value: '00410042' });
    expect(convertHexText('00410042', 'toText', 'utf16be')).toEqual({ ok: true, value: 'AB' });
  });

  it('rejects non-ASCII text in ascii mode', () => {
    expect(convertHexText('café', 'toHex', 'ascii').ok).toBe(false);
  });

  it('rejects invalid hex when decoding', () => {
    expect(convertHexText('zz', 'toText', 'ascii').ok).toBe(false);
  });
});
