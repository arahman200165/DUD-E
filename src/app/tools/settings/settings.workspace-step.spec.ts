import { beforeEach, describe, expect, it } from 'vitest';
import { workspaceStep } from './settings.workspace-step';

describe('settings workspaceStep', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('returns undefined when there is nothing to snapshot', () => {
    expect(workspaceStep.snapshot()).toBeUndefined();
  });

  it('round-trips relayUrl through snapshot and restore', () => {
    workspaceStep.restore({ relayUrl: 'ws://example.com' });
    expect(workspaceStep.snapshot()?.state).toEqual({ relayUrl: 'ws://example.com' });
  });

  it('is not history-eligible', () => {
    expect(workspaceStep.historyEligible).toBeUndefined();
  });
});
