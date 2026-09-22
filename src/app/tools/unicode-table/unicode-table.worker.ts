/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { runUnicodeTableRequest, UnicodeTableRequest } from './unicode-table-browse';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<UnicodeTableRequest>>): void {
  const { id, payload } = data;

  try {
    const result = runUnicodeTableRequest(payload);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
