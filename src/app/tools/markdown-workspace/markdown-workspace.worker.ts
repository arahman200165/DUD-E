/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { buildWorkspaceResult } from './markdown-workspace-render';
import { MarkdownWorkspacePayload } from './markdown-workspace-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<MarkdownWorkspacePayload>>): void {
  const { id, payload } = data;

  try {
    const result = buildWorkspaceResult(payload.source);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
