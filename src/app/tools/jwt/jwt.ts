import { Component, computed, inject, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { PasteHandoffService } from '../../core/paste-detect/paste-handoff.service';
import { consumeWorkspaceState } from '../../core/workspace/workspace-handoff';
import { JwtExpiryStatus, decodeJwt, decodeTemporalClaim } from './jwt-decode';

const EXPIRY_BADGE_CLASSES: Record<JwtExpiryStatus['kind'], string> = {
  expired: 'border-error/40 bg-error/10 text-error',
  valid: 'border-success/40 bg-success/10 text-success',
  'no-claim': 'border-border text-text-muted',
};

/**
 * Deliberately does NOT inject PersistenceService — JWTs are sensitive and
 * this tool must never persist input, even under a `session` policy
 * (PRD Section 14.1/30: JWT values are the canonical "no automatic
 * persistence" example, and a plain in-memory signal is the simplest way
 * to guarantee that no storage backend is ever touched).
 */
@Component({
  selector: 'app-jwt',
  imports: [ToolShell, ErrorPanel],
  templateUrl: './jwt.html',
})
export class Jwt {
  protected readonly token = signal('');
  protected readonly result = computed(() => decodeJwt(this.token()));

  constructor() {
    // Smart Paste-Detection prefill (DUDE_PRD.md §21 Phase 21 Item 3) — see PasteHandoffService.
    // In-memory only, same as `token` above — never touches PersistenceService.
    const handoff = inject(PasteHandoffService).consume('jwt');
    if (handoff !== undefined) this.token.set(handoff);

    // Workspace tab-restore / History restore (DUDE_PRD.md §21 Phase 21 Items 4-5) — see
    // jwt.workspace-step.ts. Same in-memory-only shape as the Smart Paste hand-off above.
    const workspaceState = consumeWorkspaceState('jwt');
    if (typeof workspaceState?.['token'] === 'string') this.token.set(workspaceState['token']);
  }

  protected readonly issuedAt = computed(() => {
    const current = this.result();
    return current.ok ? decodeTemporalClaim(current.payload, 'iat') : null;
  });

  protected readonly notBefore = computed(() => {
    const current = this.result();
    return current.ok ? decodeTemporalClaim(current.payload, 'nbf') : null;
  });

  protected onTokenInput(event: Event): void {
    this.token.set((event.target as HTMLTextAreaElement).value);
  }

  protected clear(): void {
    this.token.set('');
  }

  protected format(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }

  protected expiryBadgeClasses(kind: JwtExpiryStatus['kind']): string {
    return EXPIRY_BADGE_CLASSES[kind];
  }
}
