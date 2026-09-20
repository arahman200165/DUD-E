import { Injectable, inject } from '@angular/core';
import { PlatformService } from './platform.service';
import type { FileWatchEvent } from './electron-bridge';

/**
 * Renderer-side client for Stage 5's file-watch infrastructure. Nothing in
 * the app calls this yet — see `electron/file-watch-bridge.ts`'s doc
 * comment for why auto-reload-on-change is deliberately not wired into any
 * tool without a resolved "reload / keep my edits" UX first. Exposed here
 * so a future tool can opt in without touching `electron/` at all.
 */
@Injectable({ providedIn: 'root' })
export class FileWatchService {
  private readonly platform = inject(PlatformService);

  async watch(rootPath: string, relativePath: string): Promise<string> {
    if (!this.platform.isDesktop()) throw new Error('File watching is only available in the desktop app.');
    const result = await window.dude!.fileWatch.watch(rootPath, relativePath);
    if (!result.ok) throw new Error(result.error);
    return result.watchId;
  }

  async unwatch(watchId: string): Promise<void> {
    if (!this.platform.isDesktop()) return;
    await window.dude!.fileWatch.unwatch(watchId);
  }

  /** Returns an unsubscribe function; the caller is responsible for calling it (e.g. in `ngOnDestroy`). */
  onEvent(callback: (event: FileWatchEvent) => void): () => void {
    if (!this.platform.isDesktop()) return () => {};
    return window.dude!.fileWatch.onEvent(callback);
  }
}
