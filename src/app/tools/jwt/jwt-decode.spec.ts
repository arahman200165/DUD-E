import { decodeJwt, decodeTemporalClaim } from './jwt-decode';

function toBase64Url(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildToken(header: unknown, payload: unknown, signature = 'sig'): string {
  return `${toBase64Url(header)}.${toBase64Url(payload)}.${signature}`;
}

describe('decodeJwt', () => {
  it('decodes a well-formed token', () => {
    const token = buildToken({ alg: 'HS256', typ: 'JWT' }, { sub: 'abc123' }, 'signature-segment');

    const result = decodeJwt(token);

    expect(result.ok).toBe(true);
    expect(result.ok && result.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(result.ok && result.payload).toEqual({ sub: 'abc123' });
    expect(result.ok && result.signature).toBe('signature-segment');
  });

  it('rejects empty input', () => {
    expect(decodeJwt('').ok).toBe(false);
  });

  it('rejects a token without three segments', () => {
    expect(decodeJwt('only.two').ok).toBe(false);
  });

  it('rejects a token whose payload is not valid Base64url/JSON', () => {
    const token = buildToken({ alg: 'HS256' }, { sub: 'x' });
    const corrupted = `${token.split('.')[0]}.not-valid-json-base64.${token.split('.')[2]}`;

    expect(decodeJwt(corrupted).ok).toBe(false);
  });

  it('reports "no-claim" expiry when there is no exp claim', () => {
    const token = buildToken({ alg: 'HS256' }, { sub: 'abc' });

    const result = decodeJwt(token);

    expect(result.ok && result.expiry).toEqual({ kind: 'no-claim' });
  });

  it('reports "expired" when exp is in the past relative to `now`', () => {
    const token = buildToken({ alg: 'HS256' }, { exp: 1_000_000 });

    const result = decodeJwt(token, new Date(2_000_000_000));

    expect(result.ok && result.expiry.kind).toBe('expired');
  });

  it('reports "valid" when exp is in the future relative to `now`', () => {
    const token = buildToken({ alg: 'HS256' }, { exp: 9_999_999_999 });

    const result = decodeJwt(token, new Date(0));

    expect(result.ok && result.expiry.kind).toBe('valid');
  });
});

describe('decodeTemporalClaim', () => {
  it('converts a numeric claim to a Date', () => {
    expect(decodeTemporalClaim({ iat: 1_700_000_000 }, 'iat')).toEqual(new Date(1_700_000_000_000));
  });

  it('returns null when the claim is missing', () => {
    expect(decodeTemporalClaim({}, 'nbf')).toBeNull();
  });

  it('returns null when the claim is not a number', () => {
    expect(decodeTemporalClaim({ exp: 'soon' }, 'exp')).toBeNull();
  });
});
