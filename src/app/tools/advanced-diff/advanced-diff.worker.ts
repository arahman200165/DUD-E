/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { computeLineDiff } from '../diff/text-diff';
import { computeCharDiff, computeWordDiff } from './char-word-diff';
import { AdvancedDiffPayload } from './advanced-diff-payload';
import { AdvancedDiffResult } from './advanced-diff-result';

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

    const result: AdvancedDiffResult = { lineDiff, fineDiff };
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
