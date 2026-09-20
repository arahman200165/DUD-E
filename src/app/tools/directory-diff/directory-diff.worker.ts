/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { diffDirectoryPayload, DirectoryDiffPayload } from './directory-tree-diff';

export async function handleMessage({ data }: MessageEvent<WorkerRequestMessage<DirectoryDiffPayload>>): Promise<void> {
  const { id, payload } = data;

  try {
    const entries = await diffDirectoryPayload(payload);
    postMessage(resultMessage(id, entries));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
