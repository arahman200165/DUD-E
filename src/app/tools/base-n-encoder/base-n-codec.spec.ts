import { describe, expect, it } from 'vitest';
import { BASE_N_MODES, BaseNMode, decodeToBytes, encodeBytes } from './base-n-codec';

const SAMPLE = new TextEncoder().encode('The quick brown fox jumps over the lazy dog!');

describe('encodeBytes / decodeToBytes round-trip', () => {
  for (const { id } of BASE_N_MODES) {
    it(`round-trips arbitrary bytes through ${id}`, () => {
      const encoded = encodeBytes(SAMPLE, id);
      const decoded = decodeToBytes(encoded, id);
      expect(decoded.ok && Array.from(decoded.value)).toEqual(Array.from(SAMPLE));
    });
  }

  it('round-trips leading zero bytes (the classic Base58 edge case)', () => {
    const withLeadingZeros = new Uint8Array([0, 0, 0, 1, 2, 3]);
    for (const mode of ['base58', 'base62', 'base36'] as const satisfies readonly BaseNMode[]) {
      const encoded = encodeBytes(withLeadingZeros, mode);
      const decoded = decodeToBytes(encoded, mode);
      expect(decoded.ok && Array.from(decoded.value)).toEqual(Array.from(withLeadingZeros));
    }
  });
});

describe('Base85 known vector', () => {
  it('matches the canonical Adobe ASCII85 example', () => {
    const bytes = new TextEncoder().encode('Man ');
    expect(encodeBytes(bytes, 'base85')).toBe('9jqo^');
    const decoded = decodeToBytes('9jqo^', 'base85');
    expect(decoded.ok && new TextDecoder().decode(decoded.value)).toBe('Man ');
  });
});

describe('error handling', () => {
  it('rejects invalid characters per mode', () => {
    expect(decodeToBytes('zz', 'base16').ok).toBe(false);
    expect(decodeToBytes('!!!', 'base58').ok).toBe(false);
    expect(decodeToBytes("'''", 'base91').ok).toBe(false);
  });

  it('rejects empty input for every mode', () => {
    for (const { id } of BASE_N_MODES) {
      expect(decodeToBytes('', id).ok).toBe(false);
      expect(decodeToBytes('   ', id).ok).toBe(false);
    }
  });
});
