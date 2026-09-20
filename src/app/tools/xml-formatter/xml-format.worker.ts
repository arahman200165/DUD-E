/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { processXml } from './xml-format';
import { XmlFormatPayload } from './xml-format-payload';

export function handleMessage({ data }: MessageEvent<WorkerRequestMessage<XmlFormatPayload>>): void {
  const { id, payload } = data;

  try {
    const result = processXml(payload.input, payload.mode, payload.indent);
    postMessage(resultMessage(id, result));
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
