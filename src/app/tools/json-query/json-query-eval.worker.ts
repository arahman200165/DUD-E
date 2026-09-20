/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { evaluateQuery } from './json-query-eval';
import { JsonQueryPayload } from './json-query-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<JsonQueryPayload>>): void {
  const { id, payload } = data;

  try {
    const result = evaluateQuery(payload.jsonInput, payload.query, payload.language);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
