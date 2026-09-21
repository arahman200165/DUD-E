/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { findYamlAnchors } from './yaml-anchors-transform';
import { YamlAnchorsPayload } from './yaml-anchors-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<YamlAnchorsPayload>>): void {
  const { id, payload } = data;

  try {
    const result = findYamlAnchors(payload.input);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
