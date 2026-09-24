import { PipelineStep, PipelineStepResult, PipelineValue } from '../../shared/models/pipeline-step.model';
import { computeHash } from '../../../shared-logic/hash-compute';

/**
 * Pipeline-step adapter for the Hash Generator tool. Always computes SHA-256 —
 * until per-step params ship (DUDE_PRD.md §21 Item 2, v1.1), a pipeline step cannot
 * select a different algorithm. Runs `computeHash` directly on the calling thread
 * rather than through `hash-compute.worker.ts`: the worker is a UI-thread-responsiveness
 * optimization for the tool's own page, not a correctness requirement here.
 */
export const pipelineStep: PipelineStep = {
  accepts: ['text'],
  produces: ['text'],
  async run(input: PipelineValue): Promise<PipelineStepResult> {
    if (input.type !== 'text') {
      return { ok: false, error: { message: 'Hash Generator expects text input.', kind: 'invalid-input' } };
    }

    try {
      const hex = await computeHash(input.value, 'SHA-256');
      return { ok: true, output: { type: 'text', value: hex } };
    } catch (error) {
      return { ok: false, error: { message: error instanceof Error ? error.message : 'Failed to compute hash.', kind: 'execution-error' } };
    }
  },
};
