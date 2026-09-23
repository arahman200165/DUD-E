/// <reference lib="webworker" />

import { errorMessage, resultMessage, WorkerRequestMessage } from '../../core/workers/worker-protocol';
import { ImageCompressorWorkerPayload, ImageCompressorWorkerResult } from './image-compressor-worker-payload';

/**
 * Runs the actual WASM codec encode off the main thread -- these are
 * genuinely slow (real compression, not just a canvas.toBlob() quality
 * knob), per `tools/AGENTS.md`'s worker-required guidance for
 * always-slow operations. Codec modules are dynamically imported so only
 * the one this job actually needs gets fetched/instantiated.
 */
export async function handleMessage({ data }: MessageEvent<WorkerRequestMessage<ImageCompressorWorkerPayload>>): Promise<void> {
  const { id, payload } = data;

  try {
    const imageData = new ImageData(new Uint8ClampedArray(payload.pixels), payload.width, payload.height);

    let buffer: ArrayBuffer;
    let mime: string;

    if (payload.format === 'jpeg') {
      const { default: encode } = await import('@jsquash/jpeg/encode');
      buffer = await encode(imageData, { quality: payload.quality });
      mime = 'image/jpeg';
    } else if (payload.format === 'webp') {
      const { default: encode } = await import('@jsquash/webp/encode');
      buffer = await encode(imageData, { quality: payload.quality });
      mime = 'image/webp';
    } else {
      const { default: encode } = await import('@jsquash/png/encode');
      buffer = await encode(imageData);
      mime = 'image/png';
    }

    const result: ImageCompressorWorkerResult = { buffer, mime };
    postMessage(resultMessage(id, result), [buffer]);
  } catch (error) {
    postMessage(errorMessage(id, error));
  }
}

addEventListener('message', handleMessage);
