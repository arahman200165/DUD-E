/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { testJsonPatch } from './json-patch-test-transform';
import { JsonPatchTestPayload } from './json-patch-test-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<JsonPatchTestPayload>>): void {
  const { id, payload } = data;

  try {
    const result = testJsonPatch(payload.documentInput, payload.patchInput);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
