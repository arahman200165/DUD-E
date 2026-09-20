import { Colord, colord, extend } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import namesPlugin from 'colord/plugins/names';

extend([namesPlugin, cmykPlugin]);

export interface ColorFormats {
  readonly hex: string;
  readonly rgb: string;
  readonly hsl: string;
  readonly hsv: string;
  readonly cmyk: string;
  readonly name?: string;
}

export type ColorParseResult =
  | { readonly ok: true; readonly formats: ColorFormats }
  | { readonly ok: false; readonly error: string };

export function parseColor(input: string): ColorParseResult {
  const trimmed = input.trim();
  if (trimmed === '') return { ok: false, error: 'Enter a color to convert.' };

  const color = colord(trimmed);
  if (!color.isValid()) {
    return { ok: false, error: 'Could not recognize this as a color.' };
  }

  return { ok: true, formats: formatAll(color) };
}

function formatAll(color: Colord): ColorFormats {
  const hsv = color.toHsv();

  return {
    hex: color.toHex(),
    rgb: color.toRgbString(),
    hsl: color.toHslString(),
    hsv: `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`,
    cmyk: color.toCmykString(),
    name: color.toName({ closest: true }),
  };
}
