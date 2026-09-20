/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { validateJsonSchema } from './schema-validate';
import { SchemaValidatePayload } from './schema-validate-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<SchemaValidatePayload>>): void {
  const { id, payload } = data;

  try {
    const result = validateJsonSchema(payload.schemaText, payload.instanceText, payload.draftMode);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
