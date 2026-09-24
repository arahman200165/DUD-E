/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { inspectFile } from './file-inspector-logic';
import { FileInspectorWorkerPayload, FileInspectorWorkerResult } from './file-inspector-worker-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<FileInspectorWorkerPayload>>): void {
  const { id, payload } = data;

  try {
    const result: FileInspectorWorkerResult = inspectFile(new Uint8Array(payload.buffer), payload.fileName, payload.declaredMime);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
