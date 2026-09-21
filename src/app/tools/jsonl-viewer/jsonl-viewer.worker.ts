/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { parseJsonl } from './jsonl-viewer-transform';
import { JsonlViewerPayload } from './jsonl-viewer-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<JsonlViewerPayload>>): void {
  const { id, payload } = data;

  try {
    const result = parseJsonl(payload.input);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
