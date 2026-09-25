import { WorkspaceSnapshot, WorkspaceStep } from '../../shared/models/workspace-step.model';
import { readStorageValue, writeStorageValue } from '../../core/workspace/workspace-storage-bridge';
import { FlexContainerSettings, FlexItemSettings } from './flexbox-logic';

const TOOL_ID = 'flexbox-playground';

export const workspaceStep: WorkspaceStep = {
  historyEligible: true,

  snapshot(): WorkspaceSnapshot | undefined {
    const container = readStorageValue<FlexContainerSettings>(TOOL_ID, 'container', 'session');
    const items = readStorageValue<readonly FlexItemSettings[]>(TOOL_ID, 'items', 'session');
    if (!container) return undefined;

    return { state: { container, items: items ?? [] }, summary: `Flexbox: ${container.direction}` };
  },

  restore(state): void {
    if (state['container'] && typeof state['container'] === 'object') {
      writeStorageValue(TOOL_ID, 'container', 'session', state['container']);
    }
    if (Array.isArray(state['items'])) {
      writeStorageValue(TOOL_ID, 'items', 'session', state['items']);
    }
  },
};
