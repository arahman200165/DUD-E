export type CompressFormat = 'jpeg' | 'webp' | 'png';

export interface ImageCompressorWorkerPayload {
  readonly format: CompressFormat;
  readonly width: number;
  readonly height: number;
  /** Raw RGBA pixel bytes (an ImageData's `.data.buffer`), transferred to the worker. */
  readonly pixels: ArrayBuffer;
  /** 0-100 -- only used for jpeg/webp. */
  readonly quality: number;
}

export interface ImageCompressorWorkerResult {
  readonly buffer: ArrayBuffer;
  readonly mime: string;
}
