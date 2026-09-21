/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { lintYaml } from './yaml-lint';
import { YamlLintPayload } from './yaml-lint-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<YamlLintPayload>>): void {
  const { id, payload } = data;

  try {
    const result = lintYaml(payload.input);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
