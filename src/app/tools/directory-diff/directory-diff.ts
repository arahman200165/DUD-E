import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { BusyIndicator } from '../../shared/components/busy-indicator/busy-indicator';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { WorkerClientService } from '../../core/workers/worker-client.service';
import { WorkerJob } from '../../core/workers/worker-job';
import { PlatformService } from '../../core/platform/platform.service';
import { NativeFsService } from '../../core/platform/native-fs.service';
import { computeLineDiff, DiffLineType, DiffResult } from '../diff/text-diff';
import { scanFileList, scanNativeEntries, ScannedFile } from './directory-tree-scan';
import { DirectoryDiffFileEntry, DirectoryDiffPayload, EntryStatus, TreeDiffEntry } from './directory-tree-diff';
import { bytesToHexSpaced } from '../../shared/utils/byte-codec';
import { ByteDiffChunk, computeByteDiff, looksLikeText } from '../../shared/utils/byte-diff';

type Side = 'left' | 'right';

type DrillDown =
  | { readonly kind: 'text'; readonly diff: DiffResult }
  | { readonly kind: 'binary'; readonly chunks: readonly ByteDiffChunk[] }
  | { readonly kind: 'error'; readonly message: string };

const STATUS_ORDER: readonly EntryStatus[] = ['added', 'removed', 'changed', 'unchanged'];

const LINE_CLASSES: Record<DiffLineType, string> = {
  add: 'bg-success/10 text-success',
  remove: 'bg-error/10 text-error',
  equal: 'text-text-muted',
};

const LINE_PREFIX: Record<DiffLineType, string> = { add: '+ ', remove: '- ', equal: '  ' };

@Component({
  selector: 'app-directory-diff',
  imports: [ToolShell, BusyIndicator, ErrorPanel],
  templateUrl: './directory-diff.html',
})
export class DirectoryDiff implements OnDestroy {
  private readonly workerClient = inject(WorkerClientService);
  private readonly nativeFs = inject(NativeFsService);
  protected readonly platform = inject(PlatformService);

  protected readonly statusOrder = STATUS_ORDER;

  // Deliberately not persisted: file trees/content are arbitrary, potentially
  // sensitive local files that must never be written to storage.
  protected readonly leftFiles = signal<readonly ScannedFile[]>([]);
  protected readonly rightFiles = signal<readonly ScannedFile[]>([]);
  protected readonly leftFolderName = signal('');
  protected readonly rightFolderName = signal('');
  protected readonly leftRootPath = signal<string | null>(null);
  protected readonly rightRootPath = signal<string | null>(null);
  protected readonly scanError = signal<string | null>(null);

  protected readonly job = signal<WorkerJob<readonly TreeDiffEntry[]> | null>(null);
  protected readonly selectedPath = signal<string | null>(null);
  protected readonly drillDown = signal<DrillDown | null>(null);
  protected readonly drillDownStatus = signal<'idle' | 'loading'>('idle');

  protected readonly entries = computed<readonly TreeDiffEntry[]>(() => this.job()?.result() ?? []);

  protected readonly summary = computed(() => {
    const counts: Record<EntryStatus, number> = { added: 0, removed: 0, changed: 0, unchanged: 0 };
    for (const entry of this.entries()) counts[entry.status]++;
    return counts;
  });

  protected onLeftFolderSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.leftFiles.set(scanFileList(input.files));
    this.leftFolderName.set(input.files[0].webkitRelativePath.split('/')[0] || 'left folder');
  }

  protected onRightFolderSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.rightFiles.set(scanFileList(input.files));
    this.rightFolderName.set(input.files[0].webkitRelativePath.split('/')[0] || 'right folder');
  }

  protected async pickFolderNative(side: Side): Promise<void> {
    this.scanError.set(null);
    try {
      const picked = await this.nativeFs.pickDirectory();
      if (picked.canceled) return;
      await this.loadNativeFolder(side, picked.rootPath, picked.rootName);
    } catch (error) {
      this.scanError.set(error instanceof Error ? error.message : 'Could not read this folder.');
    }
  }

  protected async rescan(side: Side): Promise<void> {
    const rootPath = side === 'left' ? this.leftRootPath() : this.rightRootPath();
    if (!rootPath) return;
    this.scanError.set(null);
    try {
      await this.loadNativeFolder(side, rootPath, (side === 'left' ? this.leftFolderName() : this.rightFolderName()) || rootPath);
    } catch (error) {
      this.scanError.set(error instanceof Error ? error.message : 'Could not rescan this folder.');
    }
  }

  private async loadNativeFolder(side: Side, rootPath: string, rootName: string): Promise<void> {
    const entries = await this.nativeFs.walk(rootPath);
    const scanned = scanNativeEntries(entries, (relativePath) => this.nativeFs.readFile(rootPath, relativePath));
    if (side === 'left') {
      this.leftFiles.set(scanned);
      this.leftFolderName.set(rootName);
      this.leftRootPath.set(rootPath);
    } else {
      this.rightFiles.set(scanned);
      this.rightFolderName.set(rootName);
      this.rightRootPath.set(rootPath);
    }
  }

  protected async compare(): Promise<void> {
    this.job()?.cancel();
    this.selectedPath.set(null);
    this.drillDown.set(null);

    const [left, right] = await Promise.all([this.buildPayloadEntries(this.leftFiles()), this.buildPayloadEntries(this.rightFiles())]);
    const payload: DirectoryDiffPayload = { left, right };
    const transfer = [...left, ...right].map((entry) => entry.buffer);

    this.job.set(
      this.workerClient.run<DirectoryDiffPayload, readonly TreeDiffEntry[]>(
        () => new Worker(new URL('./directory-diff.worker', import.meta.url), { type: 'module' }),
        payload,
        transfer,
      ),
    );
  }

  private async buildPayloadEntries(files: readonly ScannedFile[]): Promise<DirectoryDiffFileEntry[]> {
    return Promise.all(
      files.map(async (scanned) => {
        const buffer = await scanned.read();
        return { path: scanned.path, size: buffer.byteLength, buffer };
      }),
    );
  }

  protected async inspect(entry: TreeDiffEntry): Promise<void> {
    this.selectedPath.set(entry.path);
    if (entry.status !== 'changed') {
      this.drillDown.set(null);
      return;
    }

    const left = this.leftFiles().find((f) => f.path === entry.path);
    const right = this.rightFiles().find((f) => f.path === entry.path);
    if (!left || !right) {
      this.drillDown.set({ kind: 'error', message: 'This file is no longer available — re-run Compare.' });
      return;
    }

    this.drillDownStatus.set('loading');
    try {
      const [leftBytes, rightBytes] = await Promise.all([
        left.read().then((b) => new Uint8Array(b)),
        right.read().then((b) => new Uint8Array(b)),
      ]);

      if (looksLikeText(leftBytes) && looksLikeText(rightBytes)) {
        const leftText = new TextDecoder().decode(leftBytes);
        const rightText = new TextDecoder().decode(rightBytes);
        this.drillDown.set({ kind: 'text', diff: computeLineDiff(leftText, rightText) });
      } else {
        this.drillDown.set({ kind: 'binary', chunks: computeByteDiff(leftBytes, rightBytes) });
      }
    } catch {
      this.drillDown.set({ kind: 'error', message: 'This file is no longer available — re-run Compare/Rescan.' });
    }
    this.drillDownStatus.set('idle');
  }

  protected hex(bytes: Uint8Array | null): string {
    return bytes ? bytesToHexSpaced(bytes) : '';
  }

  protected lineClasses(type: DiffLineType): string {
    return LINE_CLASSES[type];
  }

  protected linePrefix(type: DiffLineType): string {
    return LINE_PREFIX[type];
  }

  protected chunkRowClasses(equal: boolean): string {
    return equal ? '' : 'bg-error/10';
  }

  protected clear(): void {
    this.job()?.cancel();
    this.job.set(null);
    this.leftFiles.set([]);
    this.rightFiles.set([]);
    this.leftFolderName.set('');
    this.rightFolderName.set('');
    this.leftRootPath.set(null);
    this.rightRootPath.set(null);
    this.scanError.set(null);
    this.selectedPath.set(null);
    this.drillDown.set(null);
  }

  ngOnDestroy(): void {
    this.job()?.cancel();
  }
}
