/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { computeCharDiff, computeWordDiff } from './char-word-diff';
import { AdvancedDiffPayload } from './advanced-diff-payload';
import { AdvancedDiffResult } from './advanced-diff-result';
import { computeThreeWayMerge } from './three-way-merge';
import { computeLineDiffIgnoring, hasAnyIgnoreOption, normalizeWholeText } from './diff-normalize';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<AdvancedDiffPayload>>): void {
  const { id, payload } = data;

  try {
    const lineDiff = computeLineDiffIgnoring(payload.left, payload.right, payload.ignoreOptions);

    // Fine (char/word) diffing has no line-alignment invariant to remap through, so when ignore-options
    // are active it diffs the normalized text directly -- a documented display-only limitation.
    const ignoring = hasAnyIgnoreOption(payload.ignoreOptions);
    const fineLeft = ignoring ? normalizeWholeText(payload.left, payload.ignoreOptions) : payload.left;
    const fineRight = ignoring ? normalizeWholeText(payload.right, payload.ignoreOptions) : payload.right;
    const fineDiff =
      payload.granularity === 'char'
        ? computeCharDiff(fineLeft, fineRight)
        : payload.granularity === 'word'
          ? computeWordDiff(fineLeft, fineRight)
          : undefined;
    const threeWayMerge =
      payload.base !== undefined
        ? computeThreeWayMerge(payload.base, payload.left, payload.right, payload.ignoreOptions)
        : undefined;

    const result: AdvancedDiffResult = { lineDiff, fineDiff, threeWayMerge };
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
