/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { findMatches, replaceMatches } from './regex-match';
import { RegexWorkerPayload } from './regex-match-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<RegexWorkerPayload>>): void {
  const { id, payload } = data;

  try {
    const result =
      payload.kind === 'replace'
        ? replaceMatches(payload.pattern, payload.flags, payload.testText, payload.replacement)
        : findMatches(payload.pattern, payload.flags, payload.testText);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
