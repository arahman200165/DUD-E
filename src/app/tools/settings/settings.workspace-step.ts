import { WorkspaceSnapshot, WorkspaceStep } from '../../shared/models/workspace-step.model';
import { readStorageValue, writeStorageValue } from '../../core/workspace/workspace-storage-bridge';

const TOOL_ID = 'settings';

/**
 * `historyEligible` is omitted — a settings change (relay URL, etc.) isn't a "conversion" worth
 * logging, matching Pipelines' own "settings: not a transform tool" exclusion (see
 * core/pipeline/pipeline-coverage.spec.ts). Only the BYO relay URL preference is mirrored; the LLM
 * proxy config goes through SecureLocalService, not PersistenceService, and isn't touched here.
 */
export const workspaceStep: WorkspaceStep = {
  snapshot(): WorkspaceSnapshot | undefined {
    const relayUrl = readStorageValue<string>(TOOL_ID, 'relayUrl', 'local');
    if (!relayUrl) return undefined;
    return { state: { relayUrl }, summary: 'Settings: relay URL' };
  },

  restore(state): void {
    if (typeof state['relayUrl'] === 'string') writeStorageValue(TOOL_ID, 'relayUrl', 'local', state['relayUrl']);
  },
};
