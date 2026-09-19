import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SwUpdate } from '@angular/service-worker';

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

/**
 * Wraps `SwUpdate` (PRD Section 11 "update strategy") behind a signal so the
 * rest of the app stays RxJS-free. `SwUpdate.versionUpdates` is Angular's own
 * Observable-based API surface — this is the sole, intentional exception to
 * the no-RxJS convention, scoped entirely to this file via `toSignal()`.
 *
 * The Angular service worker only checks for a new version on its own during
 * a top-level navigation — a long-lived open tab would otherwise never learn
 * about a new deployment. This polls `checkForUpdate()` every 6 hours (the
 * interval Angular's own docs recommend) so the update prompt is reliable
 * even for a session left open indefinitely.
 */
@Injectable({ providedIn: 'root' })
export class UpdateService {
  private readonly swUpdate = inject(SwUpdate);

  private readonly latestEvent = toSignal(this.swUpdate.versionUpdates, { initialValue: undefined });

  readonly updateReady = computed(() => this.latestEvent()?.type === 'VERSION_READY');

  constructor() {
    if (this.swUpdate.isEnabled) {
      setInterval(() => void this.swUpdate.checkForUpdate(), CHECK_INTERVAL_MS);
    }
  }

  async activateUpdate(): Promise<void> {
    if (!this.swUpdate.isEnabled) return;
    await this.swUpdate.activateUpdate();
    window.location.reload();
  }
}
