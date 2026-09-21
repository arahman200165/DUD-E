/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { sortJsonKeys } from './json-sort-keys-transform';
import { JsonSortKeysPayload } from './json-sort-keys-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<JsonSortKeysPayload>>): void {
  const { id, payload } = data;

  try {
    const result = sortJsonKeys(payload.input, payload.recursive, payload.order);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
