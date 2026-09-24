/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { extractStringsReport } from './binary-strings-extractor-logic';
import { BinaryStringsExtractorWorkerPayload, BinaryStringsExtractorWorkerResult } from './binary-strings-extractor-worker-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<BinaryStringsExtractorWorkerPayload>>): void {
  const { id, payload } = data;

  try {
    const result: BinaryStringsExtractorWorkerResult = extractStringsReport(new Uint8Array(payload.buffer), payload.options);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
