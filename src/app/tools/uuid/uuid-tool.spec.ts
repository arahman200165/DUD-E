import { generateUuidV4, inspectUuid } from './uuid-tool';

describe('generateUuidV4', () => {
  it('generates a syntactically valid v4 UUID', () => {
    const uuid = generateUuidV4();
    expect(inspectUuid(uuid)).toEqual({ valid: true, version: 4, variant: 'RFC 4122' });
  });

  it('generates distinct values on repeated calls', () => {
    expect(generateUuidV4()).not.toEqual(generateUuidV4());
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
