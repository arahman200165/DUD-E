import { describe, expect, it } from 'vitest';
import { loadWorkspaceStep } from './workspace-step-loader';

describe('loadWorkspaceStep', () => {
  it('returns undefined for a tool with no workspace-step file', async () => {
    const step = await loadWorkspaceStep('this-tool-does-not-exist');
    expect(step).toBeUndefined();
  });

  // Tools gain `<id>.workspace-step.ts` adapters starting Milestone 290 — see
  // core/pipeline/pipeline-step-loader.spec.ts for the equivalent "resolves a real tool"
  // assertion shape this spec grows into once at least one adapter exists.
});
