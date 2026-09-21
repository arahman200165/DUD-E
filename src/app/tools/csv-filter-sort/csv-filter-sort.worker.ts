/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { filterSortCsv } from './csv-filter-sort-transform';
import { CsvFilterSortPayload } from './csv-filter-sort-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<CsvFilterSortPayload>>): void {
  const { id, payload } = data;

  try {
    const result = filterSortCsv(
      payload.input,
      payload.filterColumn,
      payload.operator,
      payload.filterValue,
      payload.sortColumn,
      payload.sortDirection,
    );
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
