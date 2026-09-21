/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { cleanCsv } from './csv-clean';
import { CsvCleanPayload } from './csv-clean-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<CsvCleanPayload>>): void {
  const { id, payload } = data;

  try {
    const result = cleanCsv(payload.input, payload.options);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
