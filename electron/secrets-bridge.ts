import { app, ipcMain, safeStorage } from 'electron';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

/**
 * OS-keychain-backed secret storage (Phase 8 Stage 3), for things like the
 * Stage 4 LLM proxy's API key. `safeStorage` only encrypts/decrypts
 * in-memory buffers — it persists nothing itself — so this module also owns
 * a small on-disk JSON store mapping `key -> base64(encryptedBuffer)`.
 * General-purpose: any future desktop feature can use this same store via
 * `SecureLocalService`, not just the LLM key.
 */

interface SecretStore {
  [key: string]: string;
}

function storePath(): string {
  return join(app.getPath('userData'), 'secure-store.json');
}

async function readStore(): Promise<SecretStore> {
  try {
    const raw = await fs.readFile(storePath(), 'utf8');
    return JSON.parse(raw) as SecretStore;
  } catch {
    return {};
  }
}

async function writeStore(store: SecretStore): Promise<void> {
  await fs.writeFile(storePath(), JSON.stringify(store), 'utf8');
}

// Serializes every read-modify-write against the on-disk store so concurrent
// IPC calls (set/remove racing on the same file) can't clobber each other.
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(fn, fn);
  queue = result.catch(() => undefined);
  return result;
}

type SecretResult<T> = ({ readonly ok: true } & T) | { readonly ok: false; readonly error: string };
type SecretVoidResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export function registerSecretsHandlers(): void {
  ipcMain.handle('dude:secrets:get', async (_event, key: string): Promise<SecretResult<{ value: string | null }>> => {
    return enqueue(async () => {
      const store = await readStore();
      const encoded = store[key];
      if (encoded === undefined) return { ok: true, value: null };

      try {
        const value = safeStorage.decryptString(Buffer.from(encoded, 'base64'));
        return { ok: true, value };
      } catch {
        return { ok: false, error: 'decrypt-failed' };
      }
    });
  });

  ipcMain.handle('dude:secrets:set', async (_event, key: string, value: string): Promise<SecretVoidResult> => {
    if (!safeStorage.isEncryptionAvailable()) {
      return { ok: false, error: 'encryption-unavailable' };
    }

    return enqueue(async () => {
      const store = await readStore();
      store[key] = safeStorage.encryptString(value).toString('base64');
      await writeStore(store);
      return { ok: true };
    });
  });

  ipcMain.handle('dude:secrets:remove', async (_event, key: string): Promise<SecretVoidResult> => {
    return enqueue(async () => {
      const store = await readStore();
      delete store[key];
      await writeStore(store);
      return { ok: true };
    });
  });
}
