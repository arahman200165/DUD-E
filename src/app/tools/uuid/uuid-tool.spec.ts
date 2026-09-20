import { decodeV1Timestamp, generateUuid, generateUuidV4, inspectUuid, PREDEFINED_NAMESPACES } from './uuid-tool';

describe('generateUuidV4', () => {
  it('generates a syntactically valid v4 UUID', () => {
    const uuid = generateUuidV4();
    expect(inspectUuid(uuid)).toEqual({ valid: true, version: 4, variant: 'RFC 4122' });
  });

  it('generates distinct values on repeated calls', () => {
    expect(generateUuidV4()).not.toEqual(generateUuidV4());
  });
});

describe('generateUuid', () => {
  it('generates a v1 UUID', () => {
    const result = generateUuid('v1');
    expect(result.ok).toBe(true);
    if (result.ok) expect(inspectUuid(result.value)).toEqual({ valid: true, version: 1, variant: 'RFC 4122' });
  });

  it('generates a v7 UUID', () => {
    const result = generateUuid('v7');
    expect(result.ok).toBe(true);
    if (result.ok) expect(inspectUuid(result.value)).toEqual({ valid: true, version: 7, variant: 'RFC 4122' });
  });

  it('generates a deterministic v5 UUID from a namespace + name', () => {
    const first = generateUuid('v5', { namespace: PREDEFINED_NAMESPACES.DNS, name: 'example.com' });
    const second = generateUuid('v5', { namespace: PREDEFINED_NAMESPACES.DNS, name: 'example.com' });
    expect(first).toEqual(second);
    expect(first.ok).toBe(true);
    if (first.ok) expect(inspectUuid(first.value)).toEqual({ valid: true, version: 5, variant: 'RFC 4122' });
  });

  it('rejects v5 generation without a valid namespace', () => {
    const result = generateUuid('v5', { namespace: 'not-a-uuid', name: 'example.com' });
    expect(result).toEqual({ ok: false, error: 'Enter a valid namespace UUID.' });
  });

  it('rejects v5 generation without a name', () => {
    const result = generateUuid('v5', { namespace: PREDEFINED_NAMESPACES.DNS });
    expect(result).toEqual({ ok: false, error: 'Enter a name to hash.' });
  });
});

describe('inspectUuid', () => {
  it('parses a valid UUID and reports its version and variant', () => {
    expect(inspectUuid('550e8400-e29b-41d4-a716-446655440000')).toEqual({
      valid: true,
      version: 4,
      variant: 'RFC 4122',
    });
  });

  it('is case-insensitive', () => {
    expect(inspectUuid('550E8400-E29B-41D4-A716-446655440000')).toEqual({
      valid: true,
      version: 4,
      variant: 'RFC 4122',
    });
  });

  it('trims surrounding whitespace', () => {
    expect(inspectUuid('  550e8400-e29b-41d4-a716-446655440000  ')).toEqual({
      valid: true,
      version: 4,
      variant: 'RFC 4122',
    });
  });

  it('reports a different version correctly', () => {
    expect(inspectUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toEqual({
      valid: true,
      version: 1,
      variant: 'RFC 4122',
    });
  });

  it('rejects malformed input', () => {
    expect(inspectUuid('not-a-uuid')).toEqual({ valid: false });
  });

  it('rejects empty input', () => {
    expect(inspectUuid('')).toEqual({ valid: false });
  });

  it('rejects a UUID with an invalid variant nibble', () => {
    expect(inspectUuid('550e8400-e29b-41d4-c716-446655440000')).toEqual({ valid: false });
  });
});

describe('decodeV1Timestamp', () => {
  it('decodes the timestamp embedded in the DNS predefined namespace UUID', () => {
    // 6ba7b810-9dad-11d1-80b4-00c04fd430c8 is a well-known v1 UUID from RFC 4122 Appendix C.
    const decoded = decodeV1Timestamp(PREDEFINED_NAMESPACES.DNS);
    expect(decoded).not.toBeNull();
    expect(decoded?.getUTCFullYear()).toBeGreaterThan(1990);
    expect(decoded?.getUTCFullYear()).toBeLessThan(2000);
  });

  it('returns null for a non-v1 UUID', () => {
    expect(decodeV1Timestamp('550e8400-e29b-41d4-a716-446655440000')).toBeNull();
  });

  it('returns null for malformed input', () => {
    expect(decodeV1Timestamp('not-a-uuid')).toBeNull();
  });

  it('round-trips a freshly generated v1 UUID to roughly the current time', () => {
    const result = generateUuid('v1');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const decoded = decodeV1Timestamp(result.value);
    expect(decoded).not.toBeNull();
    expect(Math.abs((decoded as Date).getTime() - Date.now())).toBeLessThan(5000);
  });
});
