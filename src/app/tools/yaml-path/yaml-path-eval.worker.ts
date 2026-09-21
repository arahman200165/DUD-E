/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { evaluateYamlPath } from './yaml-path-eval';
import { YamlPathPayload } from './yaml-path-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<YamlPathPayload>>): void {
  const { id, payload } = data;

  try {
    const result = evaluateYamlPath(payload.yamlInput, payload.query, payload.language);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
