/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { HashOutput, computeHashes } from './hash-compute';
import { HashComputePayload } from './hash-compute-payload';

addEventListener('message', ({ data }: MessageEvent<WorkerRequestMessage<HashComputePayload>>) => {
  const { id, payload } = data;

  computeHashes(payload.text, payload.algorithms)
    .then((result: readonly HashOutput[]) => postMessage(resultMessage(id, result)))
    .catch((error: unknown) => postMessage(errorMessage(id, error)));
});
