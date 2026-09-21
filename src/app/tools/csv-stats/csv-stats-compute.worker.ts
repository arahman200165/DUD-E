/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { computeCsvStats } from './csv-stats-compute';
import { CsvStatsPayload } from './csv-stats-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<CsvStatsPayload>>): void {
  const { id, payload } = data;

  try {
    const result = computeCsvStats(payload.input);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
