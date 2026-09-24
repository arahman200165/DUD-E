/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { analyzeByteFrequency } from './byte-frequency-analyzer-logic';
import { ByteFrequencyAnalyzerWorkerPayload, ByteFrequencyAnalyzerWorkerResult } from './byte-frequency-analyzer-worker-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<ByteFrequencyAnalyzerWorkerPayload>>): void {
  const { id, payload } = data;

  try {
    const result: ByteFrequencyAnalyzerWorkerResult = analyzeByteFrequency(new Uint8Array(payload.buffer));
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
