/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { joinCsv } from './csv-join-transform';
import { CsvJoinPayload } from './csv-join-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<CsvJoinPayload>>): void {
  const { id, payload } = data;

  try {
    const result = joinCsv(payload.leftInput, payload.rightInput, payload.leftKey, payload.rightKey, payload.joinType);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
