/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { computeLineDiff } from '../diff/text-diff';
import { computeCharDiff, computeWordDiff } from './char-word-diff';
import { AdvancedDiffPayload } from './advanced-diff-payload';
import { AdvancedDiffResult } from './advanced-diff-result';
import { computeThreeWayMerge } from './three-way-merge';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<AdvancedDiffPayload>>): void {
  const { id, payload } = data;

  try {
    const lineDiff = computeLineDiff(payload.left, payload.right);
    const fineDiff =
      payload.granularity === 'char'
        ? computeCharDiff(payload.left, payload.right)
        : payload.granularity === 'word'
          ? computeWordDiff(payload.left, payload.right)
          : undefined;
    const threeWayMerge =
      payload.base !== undefined ? computeThreeWayMerge(payload.base, payload.left, payload.right) : undefined;

    const result: AdvancedDiffResult = { lineDiff, fineDiff, threeWayMerge };
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
