import { Injectable, inject, signal } from '@angular/core';
import { PlatformService } from './platform.service';

/**
 * Renderer-side wrapper for Stage 8's `electron-updater` integration.
 * Structurally mirrors the web `UpdateService` (one ready signal, one action
 * method) but stays entirely separate — the web build's `SwUpdate` path is
 * untouched. The main process (`electron/update-bridge.ts`) downloads a
 * found update automatically; this service only surfaces the "downloaded,
 * ready to install" state once, since installing is always a user-gated
 * action (`restartAndInstall`), never automatic.
 */
@Injectable({ providedIn: 'root' })
export class DesktopUpdateService {
  private readonly platform = inject(PlatformService);

  private readonly updateReadySignal = signal(false);
  readonly updateReady = this.updateReadySignal.asReadonly();

  constructor() {
    if (this.platform.isDesktop()) {
      window.dude!.update.onUpdateDownloaded(() => this.updateReadySignal.set(true));
    }
  }

  async restartAndInstall(): Promise<void> {
    if (!this.platform.isDesktop()) return;
    await window.dude!.update.quitAndInstall();
  }
}
