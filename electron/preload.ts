import { contextBridge, ipcRenderer } from 'electron';
import type { DudeElectronBridge, FileWatchEvent } from '../src/app/core/platform/electron-bridge';

const bridge: DudeElectronBridge = {
  platform: { isDesktop: true },
  fs: {
    pickDirectory: () => ipcRenderer.invoke('dude:fs:pickDirectory'),
    walk: (rootPath) => ipcRenderer.invoke('dude:fs:walk', rootPath),
    readFile: (rootPath, relativePath) => ipcRenderer.invoke('dude:fs:readFile', rootPath, relativePath),
    readdir: (rootPath, relativePath) => ipcRenderer.invoke('dude:fs:readdir', rootPath, relativePath),
    stat: (rootPath, relativePath, followSymlink) => ipcRenderer.invoke('dude:fs:stat', rootPath, relativePath, followSymlink),
  },
  secrets: {
    get: (key) => ipcRenderer.invoke('dude:secrets:get', key),
    set: (key, value) => ipcRenderer.invoke('dude:secrets:set', key, value),
    remove: (key) => ipcRenderer.invoke('dude:secrets:remove', key),
  },
  llm: {
    isConfigured: () => ipcRenderer.invoke('dude:llm:isConfigured'),
    getEndpoint: () => ipcRenderer.invoke('dude:llm:getEndpoint'),
  },
  shell: {
    getLaunchOnLogin: () => ipcRenderer.invoke('dude:shell:getLaunchOnLogin'),
    setLaunchOnLogin: (enabled) => ipcRenderer.invoke('dude:shell:setLaunchOnLogin', enabled),
  },
  quickActions: {
    list: () => ipcRenderer.invoke('dude:quickActions:list'),
    setHotkey: (actionId, accelerator) => ipcRenderer.invoke('dude:quickActions:setHotkey', actionId, accelerator),
  },
  notifications: {
    show: (title, body) => ipcRenderer.invoke('dude:notifications:show', title, body),
  },
  fileWatch: {
    watch: (rootPath, relativePath) => ipcRenderer.invoke('dude:fileWatch:watch', rootPath, relativePath),
    unwatch: (watchId) => ipcRenderer.invoke('dude:fileWatch:unwatch', watchId),
    onEvent: (callback) => {
      const listener = (_event: Electron.IpcRendererEvent, message: FileWatchEvent) => callback(message);
      ipcRenderer.on('dude:fileWatch:event', listener);
      return () => ipcRenderer.removeListener('dude:fileWatch:event', listener);
    },
  },
};

contextBridge.exposeInMainWorld('dude', bridge);
