/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { dedupeCsv } from './csv-dedupe-transform';
import { CsvDedupePayload } from './csv-dedupe-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<CsvDedupePayload>>): void {
  const { id, payload } = data;

  try {
    const result = dedupeCsv(payload.input, payload.keyColumnsInput);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
