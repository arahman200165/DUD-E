import { dialog, ipcMain } from 'electron';
import { promises as fs } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { resolveWithinRoot } from './static-server';

/**
 * Native file-access IPC for the desktop-only Directory Diff / Git Repo
 * Browser upgrades (Phase 8 Stage 2). A directory only becomes readable
 * after the user explicitly grants it via `dude:fs:pickDirectory` in this
 * session — `grantedRoots` is intentionally in-memory only (cleared on
 * restart), so a compromised/buggy renderer can't read arbitrary paths
 * without a fresh OS-level picker consent.
 */

const grantedRoots = new Set<string>();

interface NativeStatPayload {
  readonly isFile: boolean;
  readonly isDirectory: boolean;
  readonly isSymbolicLink: boolean;
  readonly size: number;
  readonly mtimeMs: number;
}

type FsResult<T> = { readonly ok: true } & T;
type FsError = { readonly ok: false; readonly error: { readonly code: string; readonly message: string } };

function toFsError(error: unknown): FsError {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : 'UNKNOWN';
  const message = error instanceof Error ? error.message : 'Unknown filesystem error.';
  return { ok: false, error: { code, message } };
}

function resolveGrantedPath(rootPath: string, relativePath: string): string | null {
  if (!grantedRoots.has(rootPath)) return null;
  return resolveWithinRoot(rootPath, relativePath);
}

async function walk(rootPath: string): Promise<readonly { readonly path: string; readonly size: number }[]> {
  const entries: { path: string; size: number }[] = [];

  async function walkDir(absoluteDir: string): Promise<void> {
    const children = await fs.readdir(absoluteDir, { withFileTypes: true });
    for (const child of children) {
      const absoluteChild = join(absoluteDir, child.name);
      if (child.isDirectory()) {
        await walkDir(absoluteChild);
      } else if (child.isFile()) {
        const info = await fs.stat(absoluteChild);
        entries.push({ path: relative(rootPath, absoluteChild).split(sep).join('/'), size: info.size });
      }
    }
  }

  await walkDir(rootPath);
  return entries;
}

export function registerFsHandlers(): void {
  ipcMain.handle('dude:fs:pickDirectory', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true };
    }
    const rootPath = result.filePaths[0];
    grantedRoots.add(rootPath);
    return { canceled: false, rootPath, rootName: rootPath.split(/[\\/]/).pop() ?? rootPath };
  });

  ipcMain.handle('dude:fs:walk', async (_event, rootPath: string): Promise<FsResult<{ entries: readonly { path: string; size: number }[] }> | FsError> => {
    if (!grantedRoots.has(rootPath)) return { ok: false, error: { code: 'EPERM', message: 'This folder was not granted via the native picker.' } };
    try {
      return { ok: true, entries: await walk(rootPath) };
    } catch (error) {
      return toFsError(error);
    }
  });

  ipcMain.handle(
    'dude:fs:readFile',
    async (_event, rootPath: string, relativePath: string): Promise<FsResult<{ data: ArrayBuffer }> | FsError> => {
      const absolute = resolveGrantedPath(rootPath, relativePath);
      if (!absolute) return { ok: false, error: { code: 'EPERM', message: 'This path is not accessible.' } };
      try {
        const buffer = await fs.readFile(absolute);
        return { ok: true, data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) };
      } catch (error) {
        return toFsError(error);
      }
    },
  );

  ipcMain.handle(
    'dude:fs:readdir',
    async (_event, rootPath: string, relativePath: string): Promise<FsResult<{ names: readonly string[] }> | FsError> => {
      const absolute = resolveGrantedPath(rootPath, relativePath);
      if (!absolute) return { ok: false, error: { code: 'EPERM', message: 'This path is not accessible.' } };
      try {
        return { ok: true, names: await fs.readdir(absolute) };
      } catch (error) {
        return toFsError(error);
      }
    },
  );

  ipcMain.handle(
    'dude:fs:stat',
    async (
      _event,
      rootPath: string,
      relativePath: string,
      followSymlink: boolean,
    ): Promise<FsResult<{ stat: NativeStatPayload }> | FsError> => {
      const absolute = resolveGrantedPath(rootPath, relativePath);
      if (!absolute) return { ok: false, error: { code: 'EPERM', message: 'This path is not accessible.' } };
      try {
        const info = followSymlink ? await fs.stat(absolute) : await fs.lstat(absolute);
        return {
          ok: true,
          stat: {
            isFile: info.isFile(),
            isDirectory: info.isDirectory(),
            isSymbolicLink: info.isSymbolicLink(),
            size: info.size,
            mtimeMs: info.mtimeMs,
          },
        };
      } catch (error) {
        return toFsError(error);
      }
    },
  );
}
