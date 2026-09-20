import { Component, signal } from '@angular/core';
import type { FsClient } from 'isomorphic-git';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { BusyIndicator } from '../../shared/components/busy-indicator/busy-indicator';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { DiffLineType, DiffResult } from '../diff/text-diff';
import { scanFileList } from '../directory-diff/directory-tree-scan';
import { buildInMemoryFs, InMemoryFile } from './git-fs-shim';
import { CommitSummary, diffCommitFiles, diffFileContent, FileChange, listCommits } from './git-diff-service';

const LINE_CLASSES: Record<DiffLineType, string> = {
  add: 'bg-success/10 text-success',
  remove: 'bg-error/10 text-error',
  equal: 'text-text-muted',
};
const LINE_PREFIX: Record<DiffLineType, string> = { add: '+ ', remove: '- ', equal: '  ' };

/**
 * Reads an entire local `.git` folder into memory (via `<input
 * webkitdirectory>`, Chromium/Firefox/Safari) and browses/diffs its commit
 * history entirely client-side via `isomorphic-git` against the read-only
 * in-memory `fs` shim in `git-fs-shim.ts`. Never persists anything — a
 * `.git` folder can contain an entire private codebase.
 */
@Component({
  selector: 'app-git-diff',
  imports: [ToolShell, BusyIndicator, ErrorPanel],
  templateUrl: './git-diff.html',
})
export class GitDiff {
  private fs: FsClient | null = null;

  protected readonly repoName = signal('');
  protected readonly loadStatus = signal<'idle' | 'loading' | 'error'>('idle');
  protected readonly loadError = signal('');
  protected readonly commits = signal<readonly CommitSummary[]>([]);

  protected readonly fromOid = signal('');
  protected readonly toOid = signal('');

  protected readonly diffStatus = signal<'idle' | 'loading' | 'error'>('idle');
  protected readonly diffError = signal('');
  protected readonly changes = signal<readonly FileChange[]>([]);

  protected readonly selectedPath = signal<string | null>(null);
  protected readonly fileDiff = signal<DiffResult | null>(null);
  protected readonly fileDiffStatus = signal<'idle' | 'loading'>('idle');

  protected async onFolderSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.clear();
    this.loadStatus.set('loading');

    const scanned = scanFileList(input.files);
    const topFolder = scanned[0]?.path.split('/')[0] ?? '';
    this.repoName.set(topFolder);

    try {
      const files: InMemoryFile[] = await Promise.all(
        scanned.map(async (entry) => ({
          path: `/${entry.path.slice(topFolder.length + 1)}`,
          data: new Uint8Array(await entry.file.arrayBuffer()),
        })),
      );

      if (!files.some((f) => f.path.startsWith('/.git/'))) {
        throw new Error('No .git folder found in the selected folder — select a folder containing a git repository.');
      }

      this.fs = buildInMemoryFs(files);
      const commits = await listCommits(this.fs, '/', 'HEAD', 200);
      this.commits.set(commits);

      if (commits.length > 0) this.toOid.set(commits[0].oid);
      if (commits.length > 1) this.fromOid.set(commits[1].oid);
      else if (commits.length === 1) this.fromOid.set(commits[0].oid);

      this.loadStatus.set('idle');
    } catch (error) {
      this.loadError.set(error instanceof Error ? error.message : 'Could not read this folder as a git repository.');
      this.loadStatus.set('error');
    }
  }

  protected onFromChange(event: Event): void {
    this.fromOid.set((event.target as HTMLSelectElement).value);
  }

  protected onToChange(event: Event): void {
    this.toOid.set((event.target as HTMLSelectElement).value);
  }

  protected async compare(): Promise<void> {
    if (!this.fs || !this.fromOid() || !this.toOid()) return;

    this.diffStatus.set('loading');
    this.diffError.set('');
    this.selectedPath.set(null);
    this.fileDiff.set(null);

    try {
      this.changes.set(await diffCommitFiles(this.fs, '/', this.fromOid(), this.toOid()));
      this.diffStatus.set('idle');
    } catch (error) {
      this.diffError.set(error instanceof Error ? error.message : 'Could not diff these commits.');
      this.diffStatus.set('error');
    }
  }

  protected async inspect(change: FileChange): Promise<void> {
    if (!this.fs) return;
    this.selectedPath.set(change.path);
    this.fileDiffStatus.set('loading');
    this.fileDiff.set(await diffFileContent(this.fs, '/', this.fromOid(), this.toOid(), change.path));
    this.fileDiffStatus.set('idle');
  }

  protected lineClasses(type: DiffLineType): string {
    return LINE_CLASSES[type];
  }

  protected linePrefix(type: DiffLineType): string {
    return LINE_PREFIX[type];
  }

  protected clear(): void {
    this.fs = null;
    this.repoName.set('');
    this.commits.set([]);
    this.fromOid.set('');
    this.toOid.set('');
    this.changes.set([]);
    this.selectedPath.set(null);
    this.fileDiff.set(null);
    this.loadStatus.set('idle');
    this.loadError.set('');
    this.diffStatus.set('idle');
    this.diffError.set('');
  }
}
