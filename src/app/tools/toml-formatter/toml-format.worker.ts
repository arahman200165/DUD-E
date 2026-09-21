/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { processToml } from './toml-format';
import { TomlFormatPayload } from './toml-format-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<TomlFormatPayload>>): void {
  const { id, payload } = data;

  try {
    const result = processToml(payload.input, payload.mode);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
