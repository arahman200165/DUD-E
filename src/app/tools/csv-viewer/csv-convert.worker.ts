/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { convertCsv } from './csv-convert';
import { CsvConvertPayload } from './csv-convert-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<CsvConvertPayload>>): void {
  const { id, payload } = data;

  try {
    const result = convertCsv(payload.input, payload.direction, payload.delimiter, payload.hasHeaderRow);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
