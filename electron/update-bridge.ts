import { app, ipcMain, type BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

/**
 * Wraps `electron-updater`'s `autoUpdater` (Phase 8 Stage 8). Downloads a
 * found update automatically in the background (`autoDownload = true`) but
 * never installs it without the user clicking "Restart & Install" in the
 * renderer — mirroring the web build's "never applied silently" update
 * precedent (`core/connectivity/update.service.ts`). Checks are driven from
 * here, not the renderer, matching how other backend lifecycle logic (the
 * LLM proxy) lives in its own `*-bridge.ts` rather than a renderer-side
 * interval.
 *
 * `autoUpdater` throws when the app isn't a real packaged install (e.g. the
 * `electron:dev`/`electron:start` unpacked launch path) — every call here is
 * caught so dev runs just no-op instead of crashing.
 */
export function registerUpdateHandlers(window: BrowserWindow): void {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('update-downloaded', (info) => {
    if (!window.webContents.isDestroyed()) {
      window.webContents.send('dude:update:downloaded', { version: info.version });
    }
  });

  autoUpdater.on('error', (error) => {
    if (!window.webContents.isDestroyed()) {
      window.webContents.send('dude:update:error', error.message);
    }
  });

  ipcMain.handle('dude:update:check', async () => {
    try {
      await autoUpdater.checkForUpdates();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Update check failed.' };
    }
  });

  ipcMain.handle('dude:update:quitAndInstall', () => {
    autoUpdater.quitAndInstall();
    return { ok: true };
  });

  setInterval(() => void autoUpdater.checkForUpdates().catch(() => {}), CHECK_INTERVAL_MS);
}

export function checkForUpdatesOnStartup(): void {
  if (!app.isPackaged) return;
  void autoUpdater.checkForUpdates().catch(() => {});
}
