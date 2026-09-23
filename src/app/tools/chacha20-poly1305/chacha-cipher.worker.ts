/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { decryptChaCha, encryptChaCha } from './chacha-cipher';
import { ChachaWorkerPayload, ChachaWorkerResult } from './chacha-cipher-payload';

async function run(payload: ChachaWorkerPayload): Promise<ChachaWorkerResult> {
  if (payload.op === 'encrypt') {
    const { bundle } = await encryptChaCha(payload.plaintext, payload.passphrase, payload.variant, payload.iterations);
    return { op: 'encrypt', bundle };
  }
  const result = await decryptChaCha(payload.bundle, payload.passphrase);
  return { op: 'decrypt', result };
}

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<ChachaWorkerPayload>>): void {
  const { id, payload } = data;

  run(payload)
    .then((result) => postMessage(resultMessage(id, result)))
    .catch((error: unknown) => postMessage(errorMessage(id, error)));
}

addEventListener('message', handleMessage);
