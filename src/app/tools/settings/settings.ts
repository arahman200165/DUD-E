import { Component, inject, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { PlatformService } from '../../core/platform/platform.service';
import { SecureLocalService } from '../../core/persistence/secure-local.service';

const TOOL_ID = 'settings';
const KEY_BASE_URL = 'llmBaseUrl';
const KEY_MODEL = 'llmModel';
const KEY_API_KEY = 'llmApiKey';

type LoadStatus = 'loading' | 'idle';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Desktop-only settings for Stage 4's local LLM proxy (base URL + model +
 * API key). Registered normally like any other tool, but self-gates its UI
 * behind `PlatformService.isDesktop()` — the registry stays platform-
 * agnostic; individual tools decide what to show.
 *
 * All three fields go through `SecureLocalService`, not
 * `PersistenceService` — even though base URL/model aren't secret, keeping
 * everything in the one OS-keychain-backed store means the main process
 * (electron/llm-bridge.ts) can read the whole config with a single
 * mechanism it already has, with no separate "push config to main" IPC
 * call and no second on-disk store for the non-secret fields.
 */
@Component({
  selector: 'app-settings',
  imports: [ToolShell, ErrorPanel],
  templateUrl: './settings.html',
})
export class Settings {
  private readonly secureLocal = inject(SecureLocalService);
  protected readonly platform = inject(PlatformService);

  protected readonly loadStatus = signal<LoadStatus>('loading');
  protected readonly baseUrl = signal('');
  protected readonly model = signal('');
  protected readonly apiKey = signal('');

  protected readonly saveStatus = signal<SaveStatus>('idle');
  protected readonly saveError = signal('');

  constructor() {
    if (this.platform.isDesktop()) {
      void this.loadConfig();
    }
  }

  private async loadConfig(): Promise<void> {
    const [baseUrl, model, apiKey] = await Promise.all([
      this.secureLocal.get(TOOL_ID, KEY_BASE_URL),
      this.secureLocal.get(TOOL_ID, KEY_MODEL),
      this.secureLocal.get(TOOL_ID, KEY_API_KEY),
    ]);
    if (baseUrl.ok && baseUrl.value) this.baseUrl.set(baseUrl.value);
    if (model.ok && model.value) this.model.set(model.value);
    if (apiKey.ok && apiKey.value) this.apiKey.set(apiKey.value);
    this.loadStatus.set('idle');
  }

  protected onBaseUrlChange(event: Event): void {
    this.baseUrl.set((event.target as HTMLInputElement).value);
  }

  protected onModelChange(event: Event): void {
    this.model.set((event.target as HTMLInputElement).value);
  }

  protected onApiKeyChange(event: Event): void {
    this.apiKey.set((event.target as HTMLInputElement).value);
  }

  protected async save(): Promise<void> {
    this.saveStatus.set('saving');
    this.saveError.set('');

    const results = await Promise.all([
      this.secureLocal.set(TOOL_ID, KEY_BASE_URL, this.baseUrl().trim()),
      this.secureLocal.set(TOOL_ID, KEY_MODEL, this.model().trim()),
      this.secureLocal.set(TOOL_ID, KEY_API_KEY, this.apiKey().trim()),
    ]);

    const failure = results.find((r) => !r.ok);
    if (failure && !failure.ok) {
      this.saveError.set(failure.error === 'encryption-unavailable' ? 'Secure storage is unavailable on this system.' : failure.error);
      this.saveStatus.set('error');
      return;
    }

    this.saveStatus.set('saved');
  }

  protected async clear(): Promise<void> {
    await Promise.all([
      this.secureLocal.remove(TOOL_ID, KEY_BASE_URL),
      this.secureLocal.remove(TOOL_ID, KEY_MODEL),
      this.secureLocal.remove(TOOL_ID, KEY_API_KEY),
    ]);
    this.baseUrl.set('');
    this.model.set('');
    this.apiKey.set('');
    this.saveStatus.set('idle');
    this.saveError.set('');
  }
}
