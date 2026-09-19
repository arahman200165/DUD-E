/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { processJson } from './json-format';
import { JsonFormatPayload } from './json-format-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<JsonFormatPayload>>): void {
  const { id, payload } = data;

  try {
    const result = processJson(payload.input, payload.mode, payload.indent);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
