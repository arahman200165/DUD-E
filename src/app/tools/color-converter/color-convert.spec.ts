import { parseColor } from './color-convert';

describe('parseColor', () => {
  it('parses a hex color and returns every format', () => {
    const result = parseColor('#ff0000');
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.formats).toEqual({
      hex: '#ff0000',
      rgb: 'rgb(255, 0, 0)',
      hsl: 'hsl(0, 100%, 50%)',
      hsv: 'hsv(0, 100%, 100%)',
      cmyk: 'device-cmyk(0% 100% 100% 0%)',
      name: 'red',
    });
  });

  it('parses an rgb() string', () => {
    const result = parseColor('rgb(0, 128, 255)');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.formats.hex).toBe('#0080ff');
  });

  it('parses an hsl() string', () => {
    const result = parseColor('hsl(0, 100%, 50%)');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.formats.hex).toBe('#ff0000');
  });

  it('parses rgba with alpha and includes it in the rgb string', () => {
    const result = parseColor('rgba(0, 128, 255, 0.5)');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.formats.rgb).toBe('rgba(0, 128, 255, 0.5)');
  });

  it('parses a named CSS color', () => {
    const result = parseColor('rebeccapurple');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.formats.hex).toBe('#663399');
    expect(result.formats.name).toBe('rebeccapurple');
  });

  it('finds the closest named color for a color with no exact name', () => {
    const result = parseColor('#ff0001');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.formats.name).toBe('red');
  });

  it('is tolerant of surrounding whitespace', () => {
    const result = parseColor('  #ff0000  ');
    expect(result.ok).toBe(true);
  });

  it('rejects an empty input', () => {
    expect(parseColor('')).toEqual({ ok: false, error: 'Enter a color to convert.' });
  });

  it('rejects unrecognized input', () => {
    expect(parseColor('not-a-color')).toEqual({
      ok: false,
      error: 'Could not recognize this as a color.',
    });
  });
});
