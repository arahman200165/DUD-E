import { describe, expect, it } from 'vitest';
import { applyRot } from './rot-cipher';

describe('ROT13', () => {
  it('shifts letters by 13, preserving case and leaving non-letters untouched', () => {
    expect(applyRot('Hello, World! 123', 'rot13')).toBe('Uryyb, Jbeyq! 123');
  });

  it('is self-inverse', () => {
    const text = 'The Quick Brown Fox.';
    expect(applyRot(applyRot(text, 'rot13'), 'rot13')).toBe(text);
  });
});

describe('ROT47', () => {
  it('shifts printable ASCII by 47, leaving control chars/whitespace untouched', () => {
    expect(applyRot('Hello, World!', 'rot47')).toBe('w6==@[ (@C=5P');
  });

  it('is self-inverse', () => {
    const text = 'The Quick Brown Fox! 123 #hashtag';
    expect(applyRot(applyRot(text, 'rot47'), 'rot47')).toBe(text);
  });
});
