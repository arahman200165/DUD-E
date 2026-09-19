/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { computeLineDiff } from './text-diff';
import { TextDiffPayload } from './text-diff-payload';

addEventListener('message', ({ data }: MessageEvent<WorkerRequestMessage<TextDiffPayload>>) => {
  const { id, payload } = data;

  try {
    const result = computeLineDiff(payload.left, payload.right);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
});
