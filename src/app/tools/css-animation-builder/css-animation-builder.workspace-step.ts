import { WorkspaceSnapshot, WorkspaceStep } from '../../shared/models/workspace-step.model';
import { readStorageValue, writeStorageValue } from '../../core/workspace/workspace-storage-bridge';
import { AnimationSettings, KeyframeStop } from './css-animation-logic';

const TOOL_ID = 'css-animation-builder';

export const workspaceStep: WorkspaceStep = {
  historyEligible: true,

  snapshot(): WorkspaceSnapshot | undefined {
    const settings = readStorageValue<AnimationSettings>(TOOL_ID, 'settings', 'session');
    const stops = readStorageValue<readonly KeyframeStop[]>(TOOL_ID, 'stops', 'session');
    if (!settings) return undefined;

    return { state: { settings, stops: stops ?? [] }, summary: `@keyframes ${settings.name} (${settings.durationSeconds}s)` };
  },

  restore(state): void {
    if (state['settings'] && typeof state['settings'] === 'object') {
      writeStorageValue(TOOL_ID, 'settings', 'session', state['settings']);
    }
    if (Array.isArray(state['stops'])) {
      writeStorageValue(TOOL_ID, 'stops', 'session', state['stops']);
    }
  },
};
