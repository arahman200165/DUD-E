import { Injectable } from '@angular/core';
import type { NativeStat } from './electron-bridge';

/**
 * Thin wrapper around `window.dude.fs` (Phase 8 Stage 2) for the desktop-only
 * native folder-picker/read path in Directory Diff and Git Repo Browser.
 * Lives in `core/platform/` rather than either tool folder because both
 * tools consume it and neither owns it (`core/AGENTS.md`: no file in `core/`
 * knows a specific tool). Every method throws on an `{ ok: false }` result
 * (with `.code` set when the main process provided one) so callers use
 * ordinary try/catch instead of threading a result union through every call
 * site.
 */
@Injectable({ providedIn: 'root' })
export class NativeFsService {
  private get bridge() {
    const fs = window.dude?.fs;
    if (!fs) throw new Error('Native file access is only available in the desktop app.');
    return fs;
  }

  async pickDirectory(): Promise<{ canceled: true } | { canceled: false; rootPath: string; rootName: string }> {
    return this.bridge.pickDirectory();
  }

  async walk(rootPath: string): Promise<readonly { readonly path: string; readonly size: number }[]> {
    const result = await this.bridge.walk(rootPath);
    if (!result.ok) throw this.toError(result.error);
    return result.entries;
  }

  async readFile(rootPath: string, relativePath: string): Promise<ArrayBuffer> {
    const result = await this.bridge.readFile(rootPath, relativePath);
    if (!result.ok) throw this.toError(result.error);
    return result.data;
  }

  async readdir(rootPath: string, relativePath: string): Promise<readonly string[]> {
    const result = await this.bridge.readdir(rootPath, relativePath);
    if (!result.ok) throw this.toError(result.error);
    return result.names;
  }

  async stat(rootPath: string, relativePath: string, followSymlink: boolean): Promise<NativeStat> {
    const result = await this.bridge.stat(rootPath, relativePath, followSymlink);
    if (!result.ok) throw this.toError(result.error);
    return result.stat;
  }

  private toError(error: { readonly code: string; readonly message: string }): Error {
    const err = new Error(error.message) as Error & { code: string };
    err.code = error.code;
    return err;
  }
}
