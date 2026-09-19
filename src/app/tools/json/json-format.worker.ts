/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { processJson } from './json-format';
import { JsonFormatPayload } from './json-format-payload';

addEventListener('message', ({ data }: MessageEvent<WorkerRequestMessage<JsonFormatPayload>>) => {
  const { id, payload } = data;

  try {
    const result = processJson(payload.input, payload.mode, payload.indent);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
});
