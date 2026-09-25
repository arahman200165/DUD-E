import { Injectable, inject } from '@angular/core';
import { PersistenceService } from '../persistence/persistence.service';

/**
 * The one place "clear everything DUDE has saved on this device" goes through, so both the
 * sidebar's existing button and Settings' new one (Milestone 294) stay in sync as more storage
 * backends join — `core/history/`'s IndexedDB store (Milestone 295) extends this, rather than
 * `PersistenceService` itself ever learning about IndexedDB (it stays a localStorage/sessionStorage
 * abstraction only, preserving its single responsibility).
 */
@Injectable({ providedIn: 'root' })
export class ClearAllDataService {
  private readonly persistence = inject(PersistenceService);

  async clearAll(): Promise<void> {
    this.persistence.clearAll();
  }
}
