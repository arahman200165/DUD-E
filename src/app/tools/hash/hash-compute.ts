import { md5 } from 'js-md5';

/**
 * Pure(-ish) hash computation used by the Hash Generator tool. Runs inside
 * `hash-compute.worker.ts`. Not framework-free in the strictest sense — it
 * depends on the ambient `crypto.subtle` global — but that global exists in
 * both the main thread and worker scope (and in the jsdom test environment),
 * so it needs no Angular/DOM-specific glue.
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
