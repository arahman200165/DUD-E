/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { BenchmarkPayload, timeSample } from './regex-benchmark-run';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<BenchmarkPayload>>): void {
  const { id, payload } = data;

  try {
    postMessage(resultMessage(id, timeSample(payload)));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
