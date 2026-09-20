import { Component, computed, effect, inject, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { BusyIndicator } from '../../shared/components/busy-indicator/busy-indicator';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { CopyButton } from '../../shared/components/copy-button/copy-button';
import { FileDrop } from '../../shared/components/file-drop/file-drop';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { WorkerClientService } from '../../core/workers/worker-client.service';
import { WorkerJob } from '../../core/workers/worker-job';
import { downloadFile } from '../../shared/utils/download-file';
import { FileBase64DecodeResult, decodeBase64ToBytes, encodeFileToBase64 } from './file-base64-codec';
import { FileBase64WorkerPayload, FileBase64WorkerResult } from './file-base64-worker-payload';

/** Inputs above this size run in a Worker instead of blocking the main thread. */
const WORKER_THRESHOLD = 2_000_000;

export type FileBase64Direction = 'encode' | 'decode';

@Component({
  selector: 'app-file-base64',
  imports: [ToolShell, BusyIndicator, ErrorPanel, CopyButton, FileDrop],
  templateUrl: './file-base64.html',
})
export class FileBase64 {
  private readonly persistence = inject(PersistenceService);
  private readonly workerClient = inject(WorkerClientService);

  protected readonly direction = this.persistence.signal<FileBase64Direction>('file-base64', 'direction', 'local', 'encode');
  protected readonly downloadFilename = this.persistence.signal('file-base64', 'filename', 'local', 'download.bin');
  protected readonly base64Output = this.persistence.signal('file-base64', 'output', 'session', '');
  protected readonly base64Input = this.persistence.signal('file-base64', 'input', 'session', '');

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly rejection = signal<string | null>(null);
  private readonly jobSignal = signal<WorkerJob<FileBase64WorkerResult> | null>(null);
  protected readonly job = this.jobSignal.asReadonly();

  protected readonly usesDecodeWorker = computed(() => this.base64Input().length > WORKER_THRESHOLD);

  private readonly syncDecodeResult = computed<FileBase64DecodeResult | null>(() => {
    if (this.direction() !== 'decode' || this.usesDecodeWorker() || this.base64Input() === '') return null;
    return decodeBase64ToBytes(this.base64Input());
  });

  protected readonly decodeResult = computed<FileBase64DecodeResult | null>(() => {
    if (this.direction() !== 'decode') return null;
    if (!this.usesDecodeWorker()) return this.syncDecodeResult();

    const result = this.job()?.result();
    return result && result.direction === 'decode' ? result.decoded : null;
  });

  constructor() {
    // Pushes a completed encode worker job's result into the persisted output signal.
    effect(() => {
      const result = this.job()?.result();
      if (result && result.direction === 'encode') this.base64Output.set(result.base64);
    });

    // Auto-dispatches a decode job to a Worker once pasted Base64 crosses the size threshold.
    effect((onCleanup) => {
      if (this.direction() !== 'decode') return;

      const base64Input = this.base64Input();
      if (base64Input.length <= WORKER_THRESHOLD) return;

      const job = this.workerClient.run<FileBase64WorkerPayload, FileBase64WorkerResult>(
        () => new Worker(new URL('./file-base64.worker', import.meta.url), { type: 'module' }),
        { direction: 'decode', base64: base64Input },
      );
      this.jobSignal.set(job);
      onCleanup(() => job.cancel());
    });
  }

  protected setDirection(direction: FileBase64Direction): void {
    this.job()?.cancel();
    this.jobSignal.set(null);
    this.rejection.set(null);
    this.direction.set(direction);
  }

  protected async onFileSelected(file: File): Promise<void> {
    this.job()?.cancel();
    this.jobSignal.set(null);
    this.rejection.set(null);
    this.selectedFile.set(file);

    const buffer = await file.arrayBuffer();

    if (buffer.byteLength > WORKER_THRESHOLD) {
      this.jobSignal.set(
        this.workerClient.run<FileBase64WorkerPayload, FileBase64WorkerResult>(
          () => new Worker(new URL('./file-base64.worker', import.meta.url), { type: 'module' }),
          { direction: 'encode', buffer },
          [buffer],
        ),
      );
    } else {
      this.base64Output.set(encodeFileToBase64(buffer));
    }
  }

  protected onRejected(message: string): void {
    this.rejection.set(message);
  }

  protected onBase64InputChange(event: Event): void {
    this.base64Input.set((event.target as HTMLTextAreaElement).value);
  }

  protected onFilenameChange(event: Event): void {
    this.downloadFilename.set((event.target as HTMLInputElement).value);
  }

  protected download(): void {
    const result = this.decodeResult();
    if (result?.ok) downloadFile(result.bytes, this.downloadFilename() || 'download.bin');
  }

  protected clear(): void {
    this.job()?.cancel();
    this.jobSignal.set(null);
    this.rejection.set(null);
    this.selectedFile.set(null);
    this.base64Output.set('');
    this.base64Input.set('');
  }
}
