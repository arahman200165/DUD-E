import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { startStaticServer } from './static-server';

const DEV_SERVER_URL = process.env['DUDE_ELECTRON_DEV_SERVER_URL'];

async function resolveWindowUrl(): Promise<string> {
  if (DEV_SERVER_URL) {
    return DEV_SERVER_URL;
  }
  const browserDistRoot = join(app.getAppPath(), 'dist/dude/browser');
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

  await window.loadURL(await resolveWindowUrl());
}

void app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
