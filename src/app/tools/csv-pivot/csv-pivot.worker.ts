/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { pivotCsv } from './csv-pivot-transform';
import { CsvPivotPayload } from './csv-pivot-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<CsvPivotPayload>>): void {
  const { id, payload } = data;

  try {
    const result = pivotCsv(payload.input, payload.rowKeyColumn, payload.columnKeyColumn, payload.valueColumn, payload.aggregation);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
