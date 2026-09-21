/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { generateJsonPatch } from './json-patch-generate-transform';
import { JsonPatchGeneratePayload } from './json-patch-generate-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<JsonPatchGeneratePayload>>): void {
  const { id, payload } = data;

  try {
    const result = generateJsonPatch(payload.beforeInput, payload.afterInput);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
