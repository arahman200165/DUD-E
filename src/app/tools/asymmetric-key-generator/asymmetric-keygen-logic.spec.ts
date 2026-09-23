import { describe, expect, it } from 'vitest';
import { AsymmetricKeyGenRequest, EC_CURVES, RSA_MODULUS_LENGTHS, generateAsymmetricKeyPair } from './asymmetric-keygen-logic';

function base64urlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

describe('asymmetric-keygen-logic', () => {
  for (const modulusLength of RSA_MODULUS_LENGTHS) {
    it(`generates an RSA-${modulusLength} key pair with PEM and JWK output`, async () => {
      const pair = await generateAsymmetricKeyPair({ family: 'rsa', modulusLength });
      expect(pair.detail).toBe(`RSA-${modulusLength}`);
      expect(pair.publicKeyPem).toMatch(/-----BEGIN PUBLIC KEY-----/);
      expect(pair.privateKeyPem).toMatch(/-----BEGIN PRIVATE KEY-----/);

      const publicJwk = JSON.parse(pair.publicKeyJwk);
      expect(publicJwk.kty).toBe('RSA');
      const modulusBytes = base64urlDecode(publicJwk.n);
      // Modulus may include a leading zero byte if the high bit is set; allow +/-8 bits of slack.
      expect(Math.abs(modulusBytes.length * 8 - modulusLength)).toBeLessThanOrEqual(8);
    });
  }

  for (const curve of EC_CURVES) {
    it(`generates a ${curve} EC key pair with PEM and JWK output`, async () => {
      const request: AsymmetricKeyGenRequest = { family: 'ec', curve };
      const pair = await generateAsymmetricKeyPair(request);
      expect(pair.detail).toBe(curve);
      expect(pair.publicKeyPem).toMatch(/-----BEGIN PUBLIC KEY-----/);
      expect(pair.privateKeyPem).toMatch(/-----BEGIN PRIVATE KEY-----/);

      const publicJwk = JSON.parse(pair.publicKeyJwk);
      expect(publicJwk.kty).toBe('EC');
      expect(publicJwk.crv).toBe(curve);
    });
  }

  it('generates an Ed25519 key pair with PEM and JWK output', async () => {
    const pair = await generateAsymmetricKeyPair({ family: 'ed25519' });
    expect(pair.detail).toBe('Ed25519');
    expect(pair.publicKeyPem).toMatch(/-----BEGIN PUBLIC KEY-----/);
    expect(pair.privateKeyPem).toMatch(/-----BEGIN PRIVATE KEY-----/);

    const publicJwk = JSON.parse(pair.publicKeyJwk);
    expect(publicJwk.kty).toBe('OKP');
    expect(publicJwk.crv).toBe('Ed25519');
  });

  it('defaults to RSA-2048 when no modulus length is given', async () => {
    const pair = await generateAsymmetricKeyPair({ family: 'rsa' });
    expect(pair.detail).toBe('RSA-2048');
  });

  it('defaults to P-256 when no curve is given', async () => {
    const pair = await generateAsymmetricKeyPair({ family: 'ec' });
    expect(pair.detail).toBe('P-256');
  });

  it('produces a different key pair on each call', async () => {
    const a = await generateAsymmetricKeyPair({ family: 'ed25519' });
    const b = await generateAsymmetricKeyPair({ family: 'ed25519' });
    expect(a.privateKeyPem).not.toBe(b.privateKeyPem);
  });
});
