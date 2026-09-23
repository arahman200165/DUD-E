import { describe, expect, it } from 'vitest';
import { decodeQrFromImageData } from './qr-decode';

function blankImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4).fill(255);
  return { data, width, height, colorSpace: 'srgb' } as ImageData;
}

describe('decodeQrFromImageData', () => {
  it('returns null for image data with no QR code present', () => {
    expect(decodeQrFromImageData(blankImageData(64, 64))).toBeNull();
  });

  it('returns null for noisy image data with no valid QR structure', () => {
    const data = new Uint8ClampedArray(64 * 64 * 4);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.floor(Math.random() * 256);
    expect(decodeQrFromImageData({ data, width: 64, height: 64, colorSpace: 'srgb' } as ImageData)).toBeNull();
  });
});
