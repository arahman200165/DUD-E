import { contextBridge } from 'electron';
import type { DudeElectronBridge } from '../src/app/core/platform/electron-bridge';

const bridge: DudeElectronBridge = {
  platform: { isDesktop: true },
};

contextBridge.exposeInMainWorld('dude', bridge);
