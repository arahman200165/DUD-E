import { describe, expect, it } from 'vitest';
import { exportJWK, generateKeyPair } from 'jose';
import { convertAllToPem, convertJwkToPem, parseJwksKeys } from './jwks-to-pem-logic';

async function makeJwk(kid: string) {
  const { publicKey } = await generateKeyPair('RS256', { extractable: true });
  const jwk = await exportJWK(publicKey);
  return { ...jwk, kid, alg: 'RS256' };
}

describe('parseJwksKeys', () => {
  it('rejects empty input', () => {
    expect(parseJwksKeys('').ok).toBe(false);
  });

  it('rejects invalid JSON', () => {
    expect(parseJwksKeys('{not json').ok).toBe(false);
  });

  it('rejects a document without a "keys" array', () => {
    expect(parseJwksKeys('{}').ok).toBe(false);
  });

  it('rejects an empty "keys" array', () => {
    expect(parseJwksKeys('{"keys": []}').ok).toBe(false);
  });

  it('parses a valid JWKS', async () => {
    const jwk = await makeJwk('key-1');
    const result = parseJwksKeys(JSON.stringify({ keys: [jwk] }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.keys).toHaveLength(1);
    expect(result.keys[0].kid).toBe('key-1');
  });
});

describe('convertJwkToPem', () => {
  it('converts an RSA JWK to a SPKI PEM public key', async () => {
    const jwk = await makeJwk('key-1');
    const result = await convertJwkToPem(jwk, 'RS256');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pem).toContain('-----BEGIN PUBLIC KEY-----');
  });

  it('rejects a symmetric ("oct") key', async () => {
    const result = await convertJwkToPem({ kty: 'oct', k: 'c2VjcmV0' }, 'HS256');
    expect(result.ok).toBe(false);
  });

  it('rejects a malformed key', async () => {
    const result = await convertJwkToPem({ kty: 'RSA' });
    expect(result.ok).toBe(false);
  });
});

describe('convertAllToPem', () => {
  it('converts every key in a batch', async () => {
    const a = await makeJwk('a');
    const b = await makeJwk('b');
    const results = await convertAllToPem([
      { raw: a, kty: 'RSA', alg: 'RS256', kid: 'a' },
      { raw: b, kty: 'RSA', alg: 'RS256', kid: 'b' },
    ]);
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.ok)).toBe(true);
  });
});
