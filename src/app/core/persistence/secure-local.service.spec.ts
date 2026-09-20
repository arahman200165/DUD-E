import { TestBed } from '@angular/core/testing';
import { SecureLocalService } from './secure-local.service';
import type { DudeElectronBridge } from '../platform/electron-bridge';

const STUB_FS: DudeElectronBridge['fs'] = {
  pickDirectory: async () => ({ canceled: true }),
  walk: async () => ({ ok: true, entries: [] }),
  readFile: async () => ({ ok: true, data: new ArrayBuffer(0) }),
  readdir: async () => ({ ok: true, names: [] }),
  stat: async () => ({ ok: true, stat: { isFile: false, isDirectory: true, isSymbolicLink: false, size: 0, mtimeMs: 0 } }),
};

describe('SecureLocalService', () => {
  const originalDude = window.dude;

  afterEach(() => {
    Object.defineProperty(window, 'dude', { value: originalDude, configurable: true });
  });

  const STUB_LLM: DudeElectronBridge['llm'] = {
    isConfigured: async () => false,
    getEndpoint: async () => ({ ok: false, error: 'not-configured' }),
  };

  function withBridge(secrets: DudeElectronBridge['secrets']): SecureLocalService {
    const bridge: DudeElectronBridge = { platform: { isDesktop: true }, fs: STUB_FS, secrets, llm: STUB_LLM };
    Object.defineProperty(window, 'dude', { value: bridge, configurable: true });
    TestBed.configureTestingModule({});
    return TestBed.inject(SecureLocalService);
  }

  it('returns not-supported on web without touching window.dude', async () => {
    Object.defineProperty(window, 'dude', { value: undefined, configurable: true });
    TestBed.configureTestingModule({});
    const service = TestBed.inject(SecureLocalService);

    await expect(service.get('settings', 'apiKey')).resolves.toEqual({ ok: false, error: 'not-supported' });
  });

  it('passes through a successful get, namespaced by tool and key', async () => {
    const keys: string[] = [];
    const service = withBridge({
      get: async (key) => {
        keys.push(key);
        return { ok: true, value: 'secret-value' };
      },
      set: async () => ({ ok: true }),
      remove: async () => ({ ok: true }),
    });

    await expect(service.get('settings', 'apiKey')).resolves.toEqual({ ok: true, value: 'secret-value' });
    expect(keys).toEqual(['dude:v1:settings:apiKey']);
  });

  it('passes through a set failure', async () => {
    const service = withBridge({
      get: async () => ({ ok: true, value: null }),
      set: async () => ({ ok: false, error: 'encryption-unavailable' }),
      remove: async () => ({ ok: true }),
    });

    await expect(service.set('settings', 'apiKey', 'x')).resolves.toEqual({ ok: false, error: 'encryption-unavailable' });
  });

  it('passes through remove', async () => {
    const keys: string[] = [];
    const service = withBridge({
      get: async () => ({ ok: true, value: null }),
      set: async () => ({ ok: true }),
      remove: async (key) => {
        keys.push(key);
        return { ok: true };
      },
    });

    await expect(service.remove('settings', 'apiKey')).resolves.toEqual({ ok: true });
    expect(keys).toEqual(['dude:v1:settings:apiKey']);
  });
});
