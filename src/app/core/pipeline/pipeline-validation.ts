import { DudeDataType } from '../../shared/models/tool-io.model';
import { PipelineStep } from '../../shared/models/pipeline-step.model';
import { PipelineStepIo, canChain } from './pipeline-compatibility';

export interface PipelineStepResolution {
  readonly stepId: string;
  readonly step: PipelineStep | undefined;
}

export interface PipelineValidationIssue {
  readonly stepId: string;
  readonly message: string;
}

export interface PipelineValidationResult {
  readonly valid: boolean;
  readonly issues: readonly PipelineValidationIssue[];
}

/**
 * The single source of truth for "is this pipeline runnable" — called by both the builder's
 * live inline warnings and `PipelineRunnerService`'s pre-flight check (never duplicated). A
 * missing step (unresolved tool/script) halts type-flow tracking from that point on, since its
 * real `produces` can't be known.
 */
export function validatePipelineChain(initialType: DudeDataType, resolutions: readonly PipelineStepResolution[]): PipelineValidationResult {
  const issues: PipelineValidationIssue[] = [];
  let upstream: PipelineStepIo = { accepts: [], produces: [initialType] };
  let upstreamUnknown = false;

  for (const { stepId, step } of resolutions) {
    if (!step) {
      issues.push({ stepId, message: 'This step is not available (its tool or script could not be found).' });
      upstreamUnknown = true;
      continue;
    }

    if (!upstreamUnknown && !canChain(upstream, step)) {
      issues.push({
        stepId,
        message: `Type mismatch: the previous step produces [${upstream.produces.join(', ')}], but this step only accepts [${step.accepts.join(', ')}]. Insert a bridge step.`,
      });
    }

    upstream = step;
    upstreamUnknown = false;
  }

  return { valid: issues.length === 0, issues };
}
