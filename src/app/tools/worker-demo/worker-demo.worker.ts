/// <reference lib="webworker" />

import { errorMessage, progressMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { analyzeTextFrequency } from './text-frequency';
import { WorkerDemoPayload } from './worker-demo-payload';

addEventListener('message', ({ data }: MessageEvent<WorkerRequestMessage<WorkerDemoPayload>>) => {
  const { id, payload } = data;

  try {
    const result = analyzeTextFrequency(payload.text, {
      triggerError: payload.triggerError,
      onProgress: (percent) => postMessage(progressMessage(id, percent)),
    });
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
});
