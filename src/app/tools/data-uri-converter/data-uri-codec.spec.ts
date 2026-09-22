import { describe, expect, it } from 'vitest';
import { decodeDataUri, generateDataUri } from './data-uri-codec';

describe('generateDataUri', () => {
  it('builds a base64 data URI from bytes and a MIME type', () => {
    const bytes = new TextEncoder().encode('hello');
    expect(generateDataUri(bytes, 'text/plain')).toBe('data:text/plain;base64,aGVsbG8=');
  });

  it('defaults to application/octet-stream when no MIME type is given', () => {
    expect(generateDataUri(new Uint8Array([1, 2, 3]), '')).toMatch(/^data:application\/octet-stream;base64,/);
  });
});

describe('decodeDataUri', () => {
  it('round-trips a generated base64 data URI', () => {
    const bytes = new TextEncoder().encode('café, 42 bytes-ish');
    const uri = generateDataUri(bytes, 'text/plain');
    const decoded = decodeDataUri(uri);
    expect(decoded.ok && decoded.mimeType).toBe('text/plain');
    expect(decoded.ok && Array.from(decoded.bytes)).toEqual(Array.from(bytes));
  });

  it('decodes a non-base64 (percent-encoded) data URI', () => {
    const decoded = decodeDataUri('data:text/plain,Hello%20World');
    expect(decoded.ok && decoded.mimeType).toBe('text/plain');
    expect(decoded.ok && new TextDecoder().decode(decoded.bytes)).toBe('Hello World');
  });

  it('defaults MIME type to text/plain when omitted', () => {
    const decoded = decodeDataUri('data:;base64,aGVsbG8=');
    expect(decoded.ok && decoded.mimeType).toBe('text/plain');
  });

  it('rejects a string that is not a data URI', () => {
    expect(decodeDataUri('not a data uri').ok).toBe(false);
    expect(decodeDataUri('').ok).toBe(false);
  });

  it('rejects invalid base64 payload', () => {
    expect(decodeDataUri('data:text/plain;base64,***not valid***').ok).toBe(false);
  });
});
