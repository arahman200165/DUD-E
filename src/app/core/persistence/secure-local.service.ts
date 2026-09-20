import { Injectable, inject } from '@angular/core';
import { PlatformService } from '../platform/platform.service';
import { buildStorageKey } from './persistence-keys';
import type { SecretResult, SecretVoidResult } from '../platform/electron-bridge';

/**
 * OS-keychain-backed secret storage (Phase 8 Stage 3), desktop-only.
 * Deliberately a standalone, fully-async service rather than a
 * `PersistenceService.signal()` policy — Electron's `safeStorage` is async,
 * and this tier is small/rare enough (currently just the Stage 4 LLM API
 * key) that a synchronous signal wrapper isn't worth the complexity.
 * Consumers own their own loading state (e.g. a signal starting at
 * `'loading'`, resolved from the returned promise).
 *
 * Reuses `buildStorageKey` so secrets share the same `dude:v1:<toolId>:<key>`
 * namespace `PersistenceService` uses for its other tiers.
 */
@Injectable({ providedIn: 'root' })
export class SecureLocalService {
  private readonly platform = inject(PlatformService);

  async get(toolId: string, key: string): Promise<SecretResult<{ value: string | null }>> {
    if (!this.platform.isDesktop()) return { ok: false, error: 'not-supported' };
    return window.dude!.secrets.get(buildStorageKey(toolId, key));
  }

  async set(toolId: string, key: string, value: string): Promise<SecretVoidResult> {
    if (!this.platform.isDesktop()) return { ok: false, error: 'not-supported' };
    return window.dude!.secrets.set(buildStorageKey(toolId, key), value);
  }

  async remove(toolId: string, key: string): Promise<SecretVoidResult> {
    if (!this.platform.isDesktop()) return { ok: false, error: 'not-supported' };
    return window.dude!.secrets.remove(buildStorageKey(toolId, key));
  }
}
