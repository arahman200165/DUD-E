import { computeHash, computeHashes } from './hash-compute';

describe('computeHash', () => {
  it('computes the known MD5 test vector for "abc"', async () => {
    expect(await computeHash('abc', 'MD5')).toBe('900150983cd24fb0d6963f7d28e17f72');
  });

  it('computes the known SHA-1 test vector for "abc"', async () => {
    expect(await computeHash('abc', 'SHA-1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });

  it('computes the known SHA-256 test vector for "abc"', async () => {
    expect(await computeHash('abc', 'SHA-256')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('produces a 96-character hex digest for SHA-384', async () => {
    expect(await computeHash('abc', 'SHA-384')).toHaveLength(96);
  });

  it('produces a 128-character hex digest for SHA-512', async () => {
    expect(await computeHash('abc', 'SHA-512')).toHaveLength(128);
  });

  it('is deterministic for the same input', async () => {
    expect(await computeHash('hello world', 'SHA-256')).toBe(await computeHash('hello world', 'SHA-256'));
  });

  it('produces different digests for different input', async () => {
    expect(await computeHash('a', 'SHA-256')).not.toBe(await computeHash('b', 'SHA-256'));
  });
});

describe('computeHashes', () => {
  it('computes multiple algorithms in the requested order', async () => {
    const results = await computeHashes('abc', ['MD5', 'SHA-1']);

    expect(results.map((r) => r.algorithm)).toEqual(['MD5', 'SHA-1']);
    expect(results[0].hex).toBe('900150983cd24fb0d6963f7d28e17f72');
  });

  it('returns an empty array for an empty algorithm list', async () => {
    expect(await computeHashes('abc', [])).toEqual([]);
  });
});
