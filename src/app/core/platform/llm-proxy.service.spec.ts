import { TestBed } from '@angular/core/testing';
import { LlmProxyService } from './llm-proxy.service';
import type { DudeElectronBridge } from './electron-bridge';

const STUB_FS: DudeElectronBridge['fs'] = {
  pickDirectory: async () => ({ canceled: true }),
  walk: async () => ({ ok: true, entries: [] }),
  readFile: async () => ({ ok: true, data: new ArrayBuffer(0) }),
  readdir: async () => ({ ok: true, names: [] }),
  stat: async () => ({ ok: true, stat: { isFile: false, isDirectory: true, isSymbolicLink: false, size: 0, mtimeMs: 0 } }),
};
const STUB_SECRETS: DudeElectronBridge['secrets'] = {
  get: async () => ({ ok: true, value: null }),
  set: async () => ({ ok: true }),
  remove: async () => ({ ok: true }),
};

describe('LlmProxyService', () => {
  const originalDude = window.dude;
  const originalFetch = window.fetch;

  afterEach(() => {
    Object.defineProperty(window, 'dude', { value: originalDude, configurable: true });
    window.fetch = originalFetch;
  });

  function withBridge(llm: DudeElectronBridge['llm']): LlmProxyService {
    const bridge: DudeElectronBridge = { platform: { isDesktop: true }, fs: STUB_FS, secrets: STUB_SECRETS, llm };
    Object.defineProperty(window, 'dude', { value: bridge, configurable: true });
    TestBed.configureTestingModule({});
    return TestBed.inject(LlmProxyService);
  }

  it('reports not configured on web', async () => {
    Object.defineProperty(window, 'dude', { value: undefined, configurable: true });
    TestBed.configureTestingModule({});
    const service = TestBed.inject(LlmProxyService);
    expect(await service.isConfigured()).toBe(false);
  });

  it('throws a friendly error on web when chat is called', async () => {
    Object.defineProperty(window, 'dude', { value: undefined, configurable: true });
    TestBed.configureTestingModule({});
    const service = TestBed.inject(LlmProxyService);
    await expect(service.chat([{ role: 'user', content: 'hi' }])).rejects.toThrow(/desktop app/);
  });

  it('throws a friendly error when no key is configured', async () => {
    const service = withBridge({ isConfigured: async () => false, getEndpoint: async () => ({ ok: false, error: 'not-configured' }) });
    await expect(service.chat([{ role: 'user', content: 'hi' }])).rejects.toThrow(/Configure an LLM provider/);
  });

  it('fetches the local proxy and returns the assistant content', async () => {
    const service = withBridge({ isConfigured: async () => true, getEndpoint: async () => ({ ok: true, port: 4321 }) });

    let calledUrl = '';
    window.fetch = vi.fn(async (url: string | URL) => {
      calledUrl = String(url);
      return new Response(JSON.stringify({ choices: [{ message: { content: 'hello there' } }] }), { status: 200 });
    }) as typeof fetch;

    expect(await service.chat([{ role: 'user', content: 'hi' }])).toBe('hello there');
    expect(calledUrl).toBe('http://127.0.0.1:4321/v1/chat');
  });

  it('throws the upstream error message on a non-ok response', async () => {
    const service = withBridge({ isConfigured: async () => true, getEndpoint: async () => ({ ok: true, port: 4321 }) });
    window.fetch = vi.fn(async () => new Response(JSON.stringify({ error: 'bad request' }), { status: 400 })) as typeof fetch;

    await expect(service.chat([{ role: 'user', content: 'hi' }])).rejects.toThrow(/bad request/);
  });
});
