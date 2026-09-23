/**
 * Minimal magic-byte sniffing for the handful of raster image formats this
 * tool cares about. Deliberately local/duplicated rather than imported from
 * `file-base64/file-signature.ts` -- tools are isolated folders per
 * `tools/AGENTS.md`, and this subset (no PDF/ZIP/WAV) is small enough that a
 * shared extraction isn't warranted yet.
 */

export interface ImageSignature {
  readonly mime: string;
  readonly extension: string;
}

interface SignatureCheck {
  readonly offset: number;
  readonly bytes: readonly number[];
}

interface SignatureRule {
  readonly checks: readonly SignatureCheck[];
  readonly signature: ImageSignature;
}

const SIGNATURE_RULES: readonly SignatureRule[] = [
  {
    checks: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
    signature: { mime: 'image/png', extension: 'png' },
  },
  {
    checks: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
    signature: { mime: 'image/jpeg', extension: 'jpg' },
  },
  {
    checks: [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }], // 'GIF8' -- covers GIF87a and GIF89a
    signature: { mime: 'image/gif', extension: 'gif' },
  },
  {
    checks: [
      { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
      { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
    ],
    signature: { mime: 'image/webp', extension: 'webp' },
  },
  {
    checks: [{ offset: 0, bytes: [0x42, 0x4d] }],
    signature: { mime: 'image/bmp', extension: 'bmp' },
  },
  {
    checks: [{ offset: 0, bytes: [0x00, 0x00, 0x01, 0x00] }],
    signature: { mime: 'image/x-icon', extension: 'ico' },
  },
];

function matchesCheck(bytes: Uint8Array, check: SignatureCheck): boolean {
  if (bytes.length < check.offset + check.bytes.length) return false;
  for (let i = 0; i < check.bytes.length; i++) {
    if (bytes[check.offset + i] !== check.bytes[i]) return false;
  }
  return true;
}

export function sniffImageType(bytes: Uint8Array): ImageSignature | null {
  for (const rule of SIGNATURE_RULES) {
    if (rule.checks.every((check) => matchesCheck(bytes, check))) return rule.signature;
  }
  return null;
}
