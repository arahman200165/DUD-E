import { Injectable, signal } from '@angular/core';

/**
 * Detects the Electron desktop shell via the flag its preload script injects
 * (`electron/preload.ts`), never `navigator.userAgent` sniffing. Exported
 * standalone (not just inlined in `PlatformService`) because `app.config.ts`
 * needs the same check at provider-construction time, before DI exists.
 */
export function isElectronRuntime(): boolean {
  return typeof window !== 'undefined' && window.dude?.platform.isDesktop === true;
}

/**
 * The app-wide "are we running as the Electron desktop app" primitive (PRD
 * Phase 8 Stage 1). The seam every later desktop-only stage (native file
 * access, secure-local persistence, LLM proxy, tray/collab) conditions on.
 */
@Injectable({ providedIn: 'root' })
export class PlatformService {
  private readonly isDesktopSignal = signal(isElectronRuntime());

  readonly isDesktop = this.isDesktopSignal.asReadonly();
}
