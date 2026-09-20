import { contextBridge, ipcRenderer } from 'electron';
import type { DudeElectronBridge } from '../src/app/core/platform/electron-bridge';

const bridge: DudeElectronBridge = {
  platform: { isDesktop: true },
  fs: {
    pickDirectory: () => ipcRenderer.invoke('dude:fs:pickDirectory'),
    walk: (rootPath) => ipcRenderer.invoke('dude:fs:walk', rootPath),
    readFile: (rootPath, relativePath) => ipcRenderer.invoke('dude:fs:readFile', rootPath, relativePath),
    readdir: (rootPath, relativePath) => ipcRenderer.invoke('dude:fs:readdir', rootPath, relativePath),
    stat: (rootPath, relativePath, followSymlink) => ipcRenderer.invoke('dude:fs:stat', rootPath, relativePath, followSymlink),
  },
};

contextBridge.exposeInMainWorld('dude', bridge);
