import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PipelineStep, PipelineStepResult, PipelineValue } from '../../shared/models/pipeline-step.model';
import { Pipeline, createPipeline, createToolStep } from './pipeline.model';
import { PipelineRunnerService } from './pipeline-runner.service';

function stepThatReturns(accepts: PipelineStep['accepts'], output: PipelineValue): PipelineStep {
  return { accepts, produces: [output.type], async run(): Promise<PipelineStepResult> {
    return { ok: true, output };
  } };
}

function failingStep(accepts: PipelineStep['accepts'], produces: PipelineStep['produces']): PipelineStep {
  return { accepts, produces, async run(): Promise<PipelineStepResult> {
    return { ok: false, error: { message: 'boom', kind: 'execution-error' } };
  } };
}

async function waitForTerminal(run: { status: () => string }): Promise<void> {
  for (let i = 0; i < 50; i++) {
    if (['succeeded', 'failed', 'blocked', 'cancelled'].includes(run.status())) return;
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

describe('PipelineRunnerService', () => {
  let service: PipelineRunnerService;
  let pipeline: Pipeline;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PipelineRunnerService);
    pipeline = createPipeline('Test');
  });

  it('runs a compatible chain to completion', async () => {
    const stepA = createToolStep('a');
    const stepB = createToolStep('b');
    pipeline = { ...pipeline, steps: [stepA, stepB] };

    const steps: Record<string, PipelineStep> = {
      a: stepThatReturns(['text'], { type: 'json', value: { hi: true } }),
      b: stepThatReturns(['json'], { type: 'text', value: 'done' }),
    };

    const run = service.runPipeline(pipeline, { type: 'text', value: 'input' }, async (ref) =>
      ref.kind === 'tool' ? steps[ref.toolId] : undefined,
    );

    await waitForTerminal(run);

    expect(run.status()).toBe('succeeded');
    expect(run.finalOutput()).toBe('done');
    expect(run.stepResults().every((result) => result.status === 'done')).toBe(true);
  });

  it('blocks (without executing) when the static chain is incompatible', async () => {
    const stepA = createToolStep('a');
    const stepB = createToolStep('b');
    pipeline = { ...pipeline, steps: [stepA, stepB] };

    const steps: Record<string, PipelineStep> = {
      a: stepThatReturns(['text'], { type: 'text', value: 'x' }),
      b: { accepts: ['table'], produces: ['table'], async run() { throw new Error('should never run'); } },
    };

    const run = service.runPipeline(pipeline, { type: 'text', value: 'input' }, async (ref) =>
      ref.kind === 'tool' ? steps[ref.toolId] : undefined,
    );

    await waitForTerminal(run);

    expect(run.status()).toBe('blocked');
  });

  it('halts the chain and skips remaining steps on a step failure', async () => {
    const stepA = createToolStep('a');
    const stepB = createToolStep('b');
    pipeline = { ...pipeline, steps: [stepA, stepB] };

    const steps: Record<string, PipelineStep> = {
      a: failingStep(['text'], ['text']),
      b: stepThatReturns(['text'], { type: 'text', value: 'unreachable' }),
    };

    const run = service.runPipeline(pipeline, { type: 'text', value: 'input' }, async (ref) =>
      ref.kind === 'tool' ? steps[ref.toolId] : undefined,
    );

    await waitForTerminal(run);

    expect(run.status()).toBe('failed');
    expect(run.stepResults()[0].status).toBe('error');
    expect(run.stepResults()[1].status).toBe('skipped');
  });

  it('cancel() stops the run', async () => {
    const stepA = createToolStep('a');
    pipeline = { ...pipeline, steps: [stepA] };

    const run = service.runPipeline(pipeline, { type: 'text', value: 'input' }, async () =>
      stepThatReturns(['text'], { type: 'text', value: 'x' }),
    );
    run.cancel();

    await waitForTerminal(run);
    expect(run.status()).toBe('cancelled');
  });
});
