import { SignJWT, base64url, exportSPKI, generateKeyPair, importJWK } from 'jose';
import { verifyJwt } from './jwt-verify-logic';

/**
 * Signs test fixtures via a JWK-imported key rather than a raw Uint8Array
 * passed straight to `.sign()` — mirrors the same realm-safety reasoning as
 * `jwt-verify-logic.ts`'s own HMAC key resolution (see the comment there).
 */
async function hmacKey(secret: string, alg: string) {
  const k = base64url.encode(new TextEncoder().encode(secret));
  return importJWK({ kty: 'oct', k }, alg);
}

describe('verifyJwt — HMAC', () => {
  it('verifies a token signed with the matching secret', async () => {
    const key = await hmacKey('super-secret', 'HS256');
    const token = await new SignJWT({ sub: 'alice' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(key);

    const result = await verifyJwt({ token, mode: 'hmac', algorithm: 'HS256', secret: 'super-secret' });

    expect(result.ok).toBe(true);
    expect(result.ok && (result.payload as { sub: string }).sub).toBe('alice');
  });

  it('fails verification with the wrong secret', async () => {
    const key = await hmacKey('super-secret', 'HS256');
    const token = await new SignJWT({ sub: 'alice' }).setProtectedHeader({ alg: 'HS256' }).sign(key);

    const result = await verifyJwt({ token, mode: 'hmac', algorithm: 'HS256', secret: 'wrong-secret' });

    expect(result.ok).toBe(false);
  });

  it('requires a secret to be provided', async () => {
    const result = await verifyJwt({ token: 'a.b.c', mode: 'hmac', algorithm: 'HS256' });
    expect(result).toEqual({ ok: false, error: 'Enter the shared secret.' });
  });
});

describe('verifyJwt — public key', () => {
  it('verifies an RS256 token against the matching SPKI PEM public key', async () => {
    const { publicKey, privateKey } = await generateKeyPair('RS256');
    const token = await new SignJWT({ sub: 'bob' }).setProtectedHeader({ alg: 'RS256' }).sign(privateKey);
    const pem = await exportSPKI(publicKey);

    const result = await verifyJwt({
      token,
      mode: 'public-key',
      algorithm: 'RS256',
      keyMaterial: pem,
      keyFormat: 'pem',
    });

    expect(result.ok).toBe(true);
  });

  it('verifies an ES256 token', async () => {
    const { publicKey, privateKey } = await generateKeyPair('ES256');
    const token = await new SignJWT({ sub: 'carol' }).setProtectedHeader({ alg: 'ES256' }).sign(privateKey);
    const pem = await exportSPKI(publicKey);

    const result = await verifyJwt({
      token,
      mode: 'public-key',
      algorithm: 'ES256',
      keyMaterial: pem,
      keyFormat: 'pem',
    });

    expect(result.ok).toBe(true);
  });

  it('rejects verifying an RS256 token as HS256 using the public key as a secret (algorithm confusion)', async () => {
    const { publicKey, privateKey } = await generateKeyPair('RS256');
    const token = await new SignJWT({ sub: 'mallory' }).setProtectedHeader({ alg: 'RS256' }).sign(privateKey);
    const pem = await exportSPKI(publicKey);

    const result = await verifyJwt({ token, mode: 'hmac', algorithm: 'HS256', secret: pem });

    expect(result.ok).toBe(false);
  });
});

describe('verifyJwt — JWKS', () => {
  it('fetches the JWKS, matches by kid, and verifies', async () => {
    const { publicKey, privateKey } = await generateKeyPair('RS256');
    const jwk = await (await import('jose')).exportJWK(publicKey);
    const kid = 'key-1';
    const token = await new SignJWT({ sub: 'dave' })
      .setProtectedHeader({ alg: 'RS256', kid })
      .sign(privateKey);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ keys: [{ ...jwk, kid }] }),
      }),
    );

    const result = await verifyJwt({ token, mode: 'jwks', algorithm: 'RS256', jwksUrl: 'https://example.com/jwks.json' });

    expect(result.ok).toBe(true);
    vi.unstubAllGlobals();
  });

  it('reports a clear error when no key in the JWKS matches the kid', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const token = await new SignJWT({ sub: 'dave' })
      .setProtectedHeader({ alg: 'RS256', kid: 'missing' })
      .sign(privateKey);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ keys: [] }),
      }),
    );

    const result = await verifyJwt({ token, mode: 'jwks', algorithm: 'RS256', jwksUrl: 'https://example.com/jwks.json' });

    expect(result.ok).toBe(false);
    vi.unstubAllGlobals();
  });

  it('reports a network-flavored error when the fetch rejects', async () => {
    const { privateKey } = await generateKeyPair('RS256');
    const token = await new SignJWT({ sub: 'dave' }).setProtectedHeader({ alg: 'RS256' }).sign(privateKey);

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const result = await verifyJwt({ token, mode: 'jwks', algorithm: 'RS256', jwksUrl: 'https://example.com/jwks.json' });

    expect(result.ok).toBe(false);
    expect(result.ok || result.error).toContain('CORS');
    vi.unstubAllGlobals();
  });

  it('requires a JWKS URL to be provided', async () => {
    const result = await verifyJwt({ token: 'a.b.c', mode: 'jwks', algorithm: 'RS256' });
    expect(result).toEqual({ ok: false, error: 'Enter a JWKS URL.' });
  });
});

describe('verifyJwt — general', () => {
  it('rejects an empty token', async () => {
    const result = await verifyJwt({ token: '', mode: 'hmac', algorithm: 'HS256', secret: 'x' });
    expect(result).toEqual({ ok: false, error: 'Enter a JWT.' });
  });
});
