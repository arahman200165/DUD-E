/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { resolveJsonPointer } from './json-pointer-transform';
import { JsonPointerPayload } from './json-pointer-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<JsonPointerPayload>>): void {
  const { id, payload } = data;

  try {
    const result = resolveJsonPointer(payload.jsonInput, payload.pointer);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
