/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { detectCsvDelimiter } from './csv-delimiter-detect';
import { CsvDelimiterDetectPayload } from './csv-delimiter-detect-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<CsvDelimiterDetectPayload>>): void {
  const { id, payload } = data;

  try {
    const result = detectCsvDelimiter(payload.input);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
