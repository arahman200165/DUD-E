/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { convertYaml } from './yaml-convert';
import { YamlConvertPayload } from './yaml-convert-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<YamlConvertPayload>>): void {
  const { id, payload } = data;

  try {
    const result = convertYaml(payload.input, payload.direction, payload.indent);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
