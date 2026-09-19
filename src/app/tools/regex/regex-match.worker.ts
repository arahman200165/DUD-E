/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { findMatches } from './regex-match';
import { RegexMatchPayload } from './regex-match-payload';

addEventListener('message', ({ data }: MessageEvent<WorkerRequestMessage<RegexMatchPayload>>) => {
  const { id, payload } = data;

  try {
    const result = findMatches(payload.pattern, payload.flags, payload.testText);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
});
