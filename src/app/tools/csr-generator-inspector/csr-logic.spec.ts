import { describe, expect, it } from 'vitest';
import { generateAsymmetricKeyPair } from '../asymmetric-key-generator/asymmetric-keygen-logic';
import { CsrSubjectField, generateCsr, inspectCsr } from './csr-logic';

async function rsaPrivateKeyPem(): Promise<string> {
  const pair = await generateAsymmetricKeyPair({ family: 'rsa', modulusLength: 2048 });
  return pair.privateKeyPem;
}

describe('csr-logic', () => {
  it('generates a CSR PEM from subject fields and a jose-generated PKCS8 RSA private key', async () => {
    const privateKeyPem = await rsaPrivateKeyPem();
    const fields: CsrSubjectField[] = [
      { shortName: 'CN', value: 'example.com' },
      { shortName: 'O', value: 'Example Org' },
    ];

    const result = generateCsr(fields, privateKeyPem);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.csrPem).toMatch(/-----BEGIN CERTIFICATE REQUEST-----/);
  });

  it('rejects generation with no non-empty subject fields', async () => {
    const privateKeyPem = await rsaPrivateKeyPem();
    const result = generateCsr([{ shortName: 'CN', value: '' }], privateKeyPem);
    expect(result.ok).toBe(false);
  });

  it('rejects generation with a malformed private key', () => {
    const result = generateCsr([{ shortName: 'CN', value: 'example.com' }], 'not a real key');
    expect(result.ok).toBe(false);
  });

  it('round-trips: a generated CSR inspects back with the same subject and a valid signature', async () => {
    const privateKeyPem = await rsaPrivateKeyPem();
    const fields: CsrSubjectField[] = [
      { shortName: 'CN', value: 'example.com' },
      { shortName: 'C', value: 'US' },
    ];
    const generated = generateCsr(fields, privateKeyPem);
    if (!generated.ok) throw new Error(generated.error);

    const inspected = inspectCsr(generated.csrPem);
    expect(inspected.ok).toBe(true);
    if (!inspected.ok) throw new Error(inspected.error);
    expect(inspected.csr.signatureValid).toBe(true);
    expect(inspected.csr.publicKeyBits).toBe(2048);
    expect(inspected.csr.subject).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ shortName: 'CN', value: 'example.com' }),
        expect.objectContaining({ shortName: 'C', value: 'US' }),
      ]),
    );
  });

  it('rejects inspecting a malformed CSR PEM', () => {
    const result = inspectCsr('not a csr');
    expect(result.ok).toBe(false);
  });

  it('rejects an EC/Ed25519 private key for CSR signing', async () => {
    const pair = await generateAsymmetricKeyPair({ family: 'ed25519' });
    const result = generateCsr([{ shortName: 'CN', value: 'example.com' }], pair.privateKeyPem);
    expect(result.ok).toBe(false);
    expect(result.ok || result.error).toMatch(/rsa/i);
  });
});
