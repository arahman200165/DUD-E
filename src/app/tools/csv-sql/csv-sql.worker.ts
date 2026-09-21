/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { convertCsvSql } from './csv-sql-transform';
import { CsvSqlPayload } from './csv-sql-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<CsvSqlPayload>>): void {
  const { id, payload } = data;

  try {
    const result = convertCsvSql(payload.input, payload.direction, payload.tableName);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
