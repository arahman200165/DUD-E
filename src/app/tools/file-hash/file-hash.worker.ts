/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { HashOutput, computeFileHashes } from '../hash/hash-compute';
import { FileHashPayload } from './file-hash-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<FileHashPayload>>): void {
  const { id, payload } = data;

  computeFileHashes(payload.buffer, payload.algorithms)
    .then((result: readonly HashOutput[]) => postMessage(resultMessage(id, result)))
    .catch((error: unknown) => postMessage(errorMessage(id, error)));
}

addEventListener('message', handleMessage);
