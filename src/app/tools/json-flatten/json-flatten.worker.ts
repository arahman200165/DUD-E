/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { flattenJson } from './json-flatten-transform';
import { JsonFlattenPayload } from './json-flatten-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<JsonFlattenPayload>>): void {
  const { id, payload } = data;

  try {
    const result = flattenJson(payload.input, payload.direction);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
