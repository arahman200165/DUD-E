import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { startStaticServer } from './static-server';
import { registerFsHandlers } from './fs-bridge';
import { registerSecretsHandlers } from './secrets-bridge';
import { registerLlmHandlers } from './llm-bridge';
import { createTray, isAppQuitting, registerShellChromeHandlers } from './tray';
import { registerHotkeyHandlers, unregisterAllHotkeys } from './hotkey-bridge';
import { registerNotificationHandlers } from './notifications-bridge';
import { closeAllFileWatches, registerFileWatchHandlers } from './file-watch-bridge';

const DEV_SERVER_URL = process.env['DUDE_ELECTRON_DEV_SERVER_URL'];

async function resolveWindowUrl(): Promise<string> {
  if (DEV_SERVER_URL) {
    return DEV_SERVER_URL;
  }
  // `__dirname` here is always `dist/electron` (esbuild's outdir), sibling to
  // `dist/dude/browser` — not `app.getAppPath()`, which resolves to the
  // entry script's own directory (not the repo root) when Electron is
  // launched with a direct file path (`electron dist/electron/main.js`)
  // rather than a project directory.
  const browserDistRoot = join(__dirname, '../dude/browser');
  const { port } = await startStaticServer(browserDistRoot);
  return `http://127.0.0.1:${port}/`;
}

async function createWindow(): Promise<void> {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Stage 5: closing the window hides it to the tray instead of quitting —
  // `isAppQuitting()` (set via `before-quit`) is what allows a real close.
  window.on('close', (event) => {
    if (!isAppQuitting()) {
      event.preventDefault();
      window.hide();
    }
  });

  createTray(window);

  await window.loadURL(await resolveWindowUrl());
}

void app.whenReady().then(async () => {
  registerFsHandlers();
  registerSecretsHandlers();
  registerLlmHandlers();
  registerShellChromeHandlers();
  registerNotificationHandlers();
  registerFileWatchHandlers();
  await registerHotkeyHandlers();
  return createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('will-quit', () => {
  unregisterAllHotkeys();
  closeAllFileWatches();
});
