import { TestBed } from '@angular/core/testing';
import { PlatformService, isElectronRuntime } from './platform.service';
import type { DudeElectronBridge } from './electron-bridge';

describe('isElectronRuntime', () => {
  const originalDude = window.dude;

  afterEach(() => {
    Object.defineProperty(window, 'dude', { value: originalDude, configurable: true });
  });

  it('is false when no bridge is present', () => {
    Object.defineProperty(window, 'dude', { value: undefined, configurable: true });
    expect(isElectronRuntime()).toBe(false);
  });

  it('is true when the preload bridge reports desktop', () => {
    const bridge: DudeElectronBridge = { platform: { isDesktop: true } };
    Object.defineProperty(window, 'dude', { value: bridge, configurable: true });
    expect(isElectronRuntime()).toBe(true);
  });
});

describe('PlatformService', () => {
  const originalDude = window.dude;

  afterEach(() => {
    Object.defineProperty(window, 'dude', { value: originalDude, configurable: true });
  });

  it('reports desktop when constructed under the Electron bridge', () => {
    const bridge: DudeElectronBridge = { platform: { isDesktop: true } };
    Object.defineProperty(window, 'dude', { value: bridge, configurable: true });

    TestBed.configureTestingModule({});
    const service = TestBed.inject(PlatformService);

    expect(service.isDesktop()).toBe(true);
  });

  it('reports web when constructed without the Electron bridge', () => {
    Object.defineProperty(window, 'dude', { value: undefined, configurable: true });

    TestBed.configureTestingModule({});
    const service = TestBed.inject(PlatformService);

    expect(service.isDesktop()).toBe(false);
  });
});
