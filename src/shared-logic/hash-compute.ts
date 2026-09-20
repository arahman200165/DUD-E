import { md5 } from 'js-md5';

/**
 * Pure(-ish) hash computation. Lives outside `src/app/` (see
 * `src/shared-logic/AGENTS.md`) because the Hash Generator/File Hash tools,
 * their workers, and `electron/hotkey-bridge.ts`'s clipboard quick-action
 * (Phase 8 Stage 5) all import it. Not framework-free in the strictest
 * sense — it depends on the ambient `crypto.subtle` global — but that
 * global exists in the main thread, worker scope, the jsdom test
 * environment, and Node (Electron's main process), so it needs no
 * Angular/DOM-specific glue.
 */

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export const HASH_ALGORITHMS: readonly HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export interface HashOutput {
  readonly algorithm: HashAlgorithm;
  readonly hex: string;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function computeHash(text: string, algorithm: HashAlgorithm): Promise<string> {
  if (algorithm === 'MD5') return md5(text);

  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algorithm, bytes);
  return toHex(digest);
}

export async function computeHashes(
  text: string,
  algorithms: readonly HashAlgorithm[],
): Promise<readonly HashOutput[]> {
  return Promise.all(algorithms.map(async (algorithm) => ({ algorithm, hex: await computeHash(text, algorithm) })));
}

/** Buffer-based sibling of `computeHash`, used by the File Hashing tool. */
export async function computeFileHash(buffer: ArrayBuffer, algorithm: HashAlgorithm): Promise<string> {
  if (algorithm === 'MD5') return md5(new Uint8Array(buffer));

  const digest = await crypto.subtle.digest(algorithm, buffer);
  return toHex(digest);
}

export async function computeFileHashes(
  buffer: ArrayBuffer,
  algorithms: readonly HashAlgorithm[],
): Promise<readonly HashOutput[]> {
  return Promise.all(
    algorithms.map(async (algorithm) => ({ algorithm, hex: await computeFileHash(buffer, algorithm) })),
  );
}
