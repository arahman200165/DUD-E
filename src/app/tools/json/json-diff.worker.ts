/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { computeJsonDiff } from './json-diff';
import { JsonDiffPayload } from './json-diff-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<JsonDiffPayload>>): void {
  const { id, payload } = data;

  try {
    const result = computeJsonDiff(payload.left, payload.right);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
