/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { mergeJson } from './json-merge-transform';
import { JsonMergePayload } from './json-merge-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<JsonMergePayload>>): void {
  const { id, payload } = data;

  try {
    const result = mergeJson(payload.baseInput, payload.overlayInput, payload.strategy);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
