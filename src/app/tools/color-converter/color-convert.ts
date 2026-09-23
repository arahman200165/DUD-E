import { Colord, colord, extend } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import namesPlugin from 'colord/plugins/names';
import labPlugin from 'colord/plugins/lab';
import lchPlugin from 'colord/plugins/lch';
import hwbPlugin from 'colord/plugins/hwb';

extend([namesPlugin, cmykPlugin, labPlugin, lchPlugin, hwbPlugin]);

export interface ColorFormats {
  readonly hex: string;
  readonly rgb: string;
  readonly hsl: string;
  readonly hsv: string;
  readonly cmyk: string;
  readonly lab: string;
  readonly lch: string;
  readonly hwb: string;
  readonly oklab: string;
  readonly oklch: string;
  readonly name?: string;
}

/**
 * OKLab/OKLCh have no colord plugin (colord's `lab`/`lch` are CIE Lab/LCH, a
 * different space). Conversion per Björn Ottosson's reference formula:
 * https://bottosson.github.io/posts/oklab/
 */
function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export interface OklabColor {
  readonly l: number;
  readonly a: number;
  readonly b: number;
}

export interface OklchColor {
  readonly l: number;
  readonly c: number;
  readonly h: number;
}

export function rgbToOklab(r: number, g: number, b: number): OklabColor {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

export function oklabToOklch(oklab: OklabColor): OklchColor {
  const c = Math.sqrt(oklab.a * oklab.a + oklab.b * oklab.b);
  const h = (Math.atan2(oklab.b, oklab.a) * (180 / Math.PI) + 360) % 360;
  return { l: oklab.l, c, h };
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
  const lab = color.toLab();
  const lch = color.toLch();
  const hwb = color.toHwb();
  const rgb = color.toRgb();
  const oklab = rgbToOklab(rgb.r, rgb.g, rgb.b);
  const oklch = oklabToOklch(oklab);

  return {
    hex: color.toHex(),
    rgb: color.toRgbString(),
    hsl: color.toHslString(),
    hsv: `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`,
    cmyk: color.toCmykString(),
    lab: `lab(${lab.l.toFixed(1)}% ${lab.a.toFixed(1)} ${lab.b.toFixed(1)})`,
    lch: `lch(${lch.l.toFixed(1)}% ${lch.c.toFixed(1)} ${lch.h.toFixed(1)})`,
    hwb: `hwb(${Math.round(hwb.h)} ${Math.round(hwb.w)}% ${Math.round(hwb.b)}%)`,
    oklab: `oklab(${(oklab.l * 100).toFixed(1)}% ${oklab.a.toFixed(4)} ${oklab.b.toFixed(4)})`,
    oklch: `oklch(${(oklch.l * 100).toFixed(1)}% ${oklch.c.toFixed(4)} ${oklch.h.toFixed(1)})`,
    name: color.toName({ closest: true }),
  };
}
