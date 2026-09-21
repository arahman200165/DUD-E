/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { convertIni } from './ini-convert';
import { IniConvertPayload } from './ini-convert-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<IniConvertPayload>>): void {
  const { id, payload } = data;

  try {
    const result = convertIni(payload.input, payload.direction);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
