export interface DudeElectronBridge {
  readonly platform: {
    readonly isDesktop: true;
  };
}

declare global {
  interface Window {
    readonly dude?: DudeElectronBridge;
  }
}

export {};
