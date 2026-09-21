/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { mergeYaml } from './yaml-merge-transform';
import { YamlMergePayload } from './yaml-merge-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<YamlMergePayload>>): void {
  const { id, payload } = data;

  try {
    const result = mergeYaml(payload.baseInput, payload.overlayInput);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
