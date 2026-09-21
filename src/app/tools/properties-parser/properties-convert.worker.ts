/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { convertProperties } from './properties-convert';
import { PropertiesConvertPayload } from './properties-convert-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<PropertiesConvertPayload>>): void {
  const { id, payload } = data;

  try {
    const result = convertProperties(payload.input, payload.direction);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
