import { describe, expect, it } from 'vitest';
import { decodeSvgDataUri, encodeSvgDataUri } from './svg-data-uri-codec';

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>';

describe('encodeSvgDataUri', () => {
  it('produces a URL-encoded data URI', () => {
    const result = encodeSvgDataUri(SVG);
    expect(result.urlEncoded.startsWith('data:image/svg+xml,')).toBe(true);
    expect(result.urlEncoded).not.toContain('<svg');
  });

  it('produces a base64 data URI', () => {
    const result = encodeSvgDataUri(SVG);
    expect(result.base64Encoded.startsWith('data:image/svg+xml;base64,')).toBe(true);
  });
});

describe('decodeSvgDataUri', () => {
  it('rejects empty input', () => {
    expect(decodeSvgDataUri('').ok).toBe(false);
  });

  it('rejects a non-SVG data URI', () => {
    expect(decodeSvgDataUri('data:text/plain,hello').ok).toBe(false);
  });

  it('round-trips URL-encoded form', () => {
    const encoded = encodeSvgDataUri(SVG);
    const decoded = decodeSvgDataUri(encoded.urlEncoded);
    expect(decoded).toEqual({ ok: true, svg: SVG });
  });

  it('round-trips base64 form', () => {
    const encoded = encodeSvgDataUri(SVG);
    const decoded = decodeSvgDataUri(encoded.base64Encoded);
    expect(decoded).toEqual({ ok: true, svg: SVG });
  });
});
