import { Injectable, signal } from '@angular/core';
import { PipelineStep, PipelineValue } from '../../shared/models/pipeline-step.model';
import { Pipeline, PipelineStepRef } from './pipeline.model';
import { PipelineRun, PipelineStepRun } from './pipeline-run';
import { validatePipelineChain } from './pipeline-validation';

/**
 * Resolves a step reference (tool or script) to its callable `PipelineStep`. The runner is
 * deliberately ignorant of *how* this happens — a tool step resolves via `loadPipelineStep`, a
 * script step needs a live sandboxed-execution surface the caller owns (see `core/pipeline/AGENTS.md`).
 */
export type PipelineStepResolver = (ref: PipelineStepRef) => Promise<PipelineStep | undefined>;

/**
 * Sequential pipeline execution (PRD §21 Item 2) — no branching/fan-out, matching the
 * linear-chain-only v1 scope. Mirrors `WorkerJob`'s signals-based handle shape.
 */
@Injectable({ providedIn: 'root' })
export class PipelineRunnerService {
  runPipeline(pipeline: Pipeline, initialInput: PipelineValue, resolveStep: PipelineStepResolver): PipelineRun {
    const statusSignal = signal<'idle' | 'running' | 'succeeded' | 'failed' | 'blocked' | 'cancelled'>('idle');
    const currentStepIndexSignal = signal<number | null>(null);
    const stepResultsSignal = signal<readonly PipelineStepRun[]>(
      pipeline.steps.map(
        (step): PipelineStepRun => ({
          stepId: step.stepId,
          status: 'pending',
          output: null,
          outputType: null,
          error: null,
          durationMs: null,
        }),
      ),
    );
    const finalOutputSignal = signal<unknown | null>(null);
    let cancelled = false;

    const patchStep = (index: number, patch: Partial<PipelineStepRun>) => {
      stepResultsSignal.update((results) => results.map((result, i) => (i === index ? { ...result, ...patch } : result)));
    };

    void (async () => {
      const resolutions = await Promise.all(
        pipeline.steps.map(async (ref) => ({ stepId: ref.stepId, step: await resolveStep(ref) })),
      );

      const validation = validatePipelineChain(initialInput.type, resolutions);
      if (!validation.valid) {
        statusSignal.set('blocked');
        for (const issue of validation.issues) {
          const index = pipeline.steps.findIndex((step) => step.stepId === issue.stepId);
          if (index !== -1) patchStep(index, { status: 'error', error: issue.message });
        }
        return;
      }

      statusSignal.set('running');
      let currentInput = initialInput;

      for (let index = 0; index < resolutions.length; index++) {
        if (cancelled) {
          statusSignal.set('cancelled');
          return;
        }

        currentStepIndexSignal.set(index);
        patchStep(index, { status: 'running' });

        const step = resolutions[index].step;
        if (!step) continue; // unreachable when validation passed — every resolution has a step

        const startedAt = performance.now();
        const result = await step.run(currentInput);
        const durationMs = performance.now() - startedAt;

        if (cancelled) {
          statusSignal.set('cancelled');
          return;
        }

        if (!result.ok) {
          patchStep(index, { status: 'error', error: result.error.message, durationMs });
          for (let skip = index + 1; skip < resolutions.length; skip++) patchStep(skip, { status: 'skipped' });
          statusSignal.set('failed');
          return;
        }

        const next = resolutions[index + 1]?.step;
        if (next && !next.accepts.includes(result.output.type)) {
          patchStep(index, { status: 'done', output: result.output.value, outputType: result.output.type, durationMs });
          patchStep(index + 1, {
            status: 'error',
            error: `Step produced '${result.output.type}' this run, but the next step only accepts [${next.accepts.join(', ')}].`,
          });
          for (let skip = index + 2; skip < resolutions.length; skip++) patchStep(skip, { status: 'skipped' });
          statusSignal.set('failed');
          return;
        }

        patchStep(index, { status: 'done', output: result.output.value, outputType: result.output.type, durationMs });
        currentInput = result.output;
      }

      finalOutputSignal.set(currentInput.value);
      statusSignal.set('succeeded');
    })();

    return {
      status: statusSignal,
      currentStepIndex: currentStepIndexSignal,
      stepResults: stepResultsSignal,
      finalOutput: finalOutputSignal,
      cancel: () => {
        cancelled = true;
      },
    };
  }
}
