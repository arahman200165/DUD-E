import { Component, computed, effect, inject, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { BusyIndicator } from '../../shared/components/busy-indicator/busy-indicator';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { FileDrop } from '../../shared/components/file-drop/file-drop';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { WorkerClientService } from '../../core/workers/worker-client.service';
import { WorkerJob } from '../../core/workers/worker-job';
import { downloadFile } from '../../shared/utils/download-file';
import { CompressFormat, ImageCompressorWorkerPayload, ImageCompressorWorkerResult } from './image-compressor-worker-payload';

@Component({
  selector: 'app-image-compressor',
  imports: [ToolShell, BusyIndicator, ErrorPanel, FileDrop],
  templateUrl: './image-compressor.html',
})
export class ImageCompressor {
  private readonly persistence = inject(PersistenceService);
  private readonly workerClient = inject(WorkerClientService);

  protected readonly format = this.persistence.signal<CompressFormat>('image-compressor', 'format', 'local', 'webp');
  protected readonly quality = this.persistence.signal('image-compressor', 'quality', 'local', 75);

  protected readonly rejection = signal<string | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly originalSize = signal(0);
  private readonly jobSignal = signal<WorkerJob<ImageCompressorWorkerResult> | null>(null);
  protected readonly job = this.jobSignal.asReadonly();

  protected readonly resultUrl = signal<string | null>(null);
  protected readonly resultSize = signal(0);
  protected readonly resultFilename = signal<string | null>(null);

  protected readonly savingsPercent = computed(() => {
    const original = this.originalSize();
    const result = this.resultSize();
    if (!original || !result) return null;
    return Math.round((1 - result / original) * 100);
  });

  constructor() {
    effect(() => {
      const result = this.job()?.result();
      if (result) this.onWorkerResult(result);
    });
  }

  protected onFileSelected(file: File): void {
    this.job()?.cancel();
    this.jobSignal.set(null);
    this.rejection.set(null);
    this.selectedFile.set(file);
    this.originalSize.set(file.size);

    const previousUrl = this.resultUrl();
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    this.resultUrl.set(null);
    this.resultSize.set(0);
  }

  protected async compress(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;

    this.job()?.cancel();
    this.rejection.set(null);

    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable.');
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data.buffer;

      const payload: ImageCompressorWorkerPayload = {
        format: this.format(),
        width: imageData.width,
        height: imageData.height,
        pixels,
        quality: this.quality(),
      };

      const job = this.workerClient.run<ImageCompressorWorkerPayload, ImageCompressorWorkerResult>(
        () => new Worker(new URL('./image-compressor.worker', import.meta.url), { type: 'module' }),
        payload,
        [pixels],
      );
      this.jobSignal.set(job);
    } catch {
      this.rejection.set("Couldn't read this image.");
    }
  }

  protected onWorkerResult(result: ImageCompressorWorkerResult | null): void {
    if (!result) return;
    const blob = new Blob([result.buffer], { type: result.mime });

    const previousUrl = this.resultUrl();
    if (previousUrl) URL.revokeObjectURL(previousUrl);

    this.resultUrl.set(URL.createObjectURL(blob));
    this.resultSize.set(blob.size);
    const extension = result.mime.split('/')[1];
    const baseName = this.selectedFile()?.name.replace(/\.\w+$/, '') ?? 'image';
    this.resultFilename.set(`${baseName}-compressed.${extension}`);
  }

  protected download(): void {
    const url = this.resultUrl();
    const filename = this.resultFilename();
    if (!url || !filename) return;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => blob.arrayBuffer())
      .then((buffer) => downloadFile(new Uint8Array(buffer), filename));
  }

  protected onRejected(message: string): void {
    this.rejection.set(message);
  }
}
