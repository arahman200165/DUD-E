import { Component, ElementRef, ViewEncapsulation, computed, effect, inject, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { SplitPane } from '../../shared/components/split-pane/split-pane';
import { BusyIndicator } from '../../shared/components/busy-indicator/busy-indicator';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { WorkerClientService } from '../../core/workers/worker-client.service';
import { WorkerJob } from '../../core/workers/worker-job';
import { downloadFile } from '../../shared/utils/download-file';
import { WorkspaceRenderResult, buildWorkspaceResult } from './markdown-workspace-render';
import { MarkdownWorkspacePayload } from './markdown-workspace-payload';
import { MarkdownInsertAction, applyMarkdownInsertion } from './markdown-toolbar-insert';
import { computeSyncedScrollTop } from './markdown-scroll-sync';

/** Inputs above this size run in a Worker instead of blocking the main thread — higher than csv-viewer/yaml-json's 50k since markdown-it rendering is cheaper per byte. */
const WORKER_THRESHOLD = 100_000;

const DEFAULT_SOURCE =
  '---\ntitle: Advanced Markdown Workspace\n---\n\n# Advanced Markdown Workspace\n\nType Markdown on the left. Try a **table**, a task list, or a heading to see the table of contents fill in.\n\n| Feature | Status |\n| --- | --- |\n| Tables | done |\n| Task lists | done |\n\n- [ ] Try me\n- [x] Already done\n';

@Component({
  selector: 'app-markdown-workspace',
  imports: [ToolShell, SplitPane, BusyIndicator],
  templateUrl: './markdown-workspace.html',
  // Emulated encapsulation adds a scoping attribute to elements the Angular
  // template compiler renders, but never to content injected via
  // [innerHTML] (that's raw HTML parsed directly into the DOM) — so scoped
  // `.markdown-body` rules would silently never match the rendered
  // Markdown at all. The same latent bug exists in the original Markdown
  // Preview tool's identical styles-block pattern (verified: its <pre>
  // background never applies either) — out of scope to fix there, but
  // this tool's whole point includes new table/task-list styling that
  // depends on these rules actually applying.
  encapsulation: ViewEncapsulation.None,
  styles: `
    .markdown-body :first-child {
      margin-top: 0;
    }
    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3 {
      font-weight: 600;
      margin: 0.75em 0 0.4em;
    }
    .markdown-body p,
    .markdown-body ul,
    .markdown-body ol,
    .markdown-body pre,
    .markdown-body blockquote,
    .markdown-body table {
      margin: 0.5em 0;
    }
    .markdown-body ul,
    .markdown-body ol {
      padding-left: 1.4em;
    }
    .markdown-body code {
      font-family: var(--font-mono);
      background: var(--color-panel-elevated);
      border-radius: 2px;
      padding: 0.1em 0.3em;
      font-size: 0.9em;
    }
    .markdown-body pre {
      background: var(--color-panel-elevated);
      border-radius: 4px;
      padding: 0.6em 0.8em;
      overflow: auto;
    }
    .markdown-body pre code {
      background: none;
      padding: 0;
    }
    .markdown-body blockquote {
      border-left: 2px solid var(--color-border);
      padding-left: 0.8em;
      color: var(--color-text-muted);
    }
    .markdown-body a {
      color: var(--color-accent);
    }
    .markdown-body table {
      border-collapse: collapse;
    }
    .markdown-body th,
    .markdown-body td {
      border: 1px solid var(--color-border);
      padding: 0.3em 0.6em;
    }
  `,
})
export class MarkdownWorkspace {
  private readonly persistence = inject(PersistenceService);
  private readonly workerClient = inject(WorkerClientService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly source = this.persistence.signal('markdown-workspace', 'source', 'session', DEFAULT_SOURCE);
  protected readonly paneRatio = this.persistence.signal('markdown-workspace', 'paneRatio', 'local', 0.5);
  protected readonly showToc = this.persistence.signal('markdown-workspace', 'showToc', 'local', true);
  protected readonly showFrontMatterPanel = this.persistence.signal(
    'markdown-workspace',
    'showFrontMatterPanel',
    'local',
    true,
  );
  protected readonly syncScroll = this.persistence.signal('markdown-workspace', 'syncScroll', 'local', true);

  private readonly sourceTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('sourceTextarea');
  private readonly previewPane = viewChild<ElementRef<HTMLDivElement>>('previewPane');

  protected readonly usesWorker = computed(() => this.source().length > WORKER_THRESHOLD);
  private readonly jobSignal = signal<WorkerJob<WorkspaceRenderResult> | null>(null);
  protected readonly job = this.jobSignal.asReadonly();

  private readonly syncResult = computed<WorkspaceRenderResult | null>(() =>
    this.usesWorker() ? null : buildWorkspaceResult(this.source()),
  );

  protected readonly result = computed<WorkspaceRenderResult | null>(() =>
    this.usesWorker() ? (this.job()?.result() ?? null) : this.syncResult(),
  );

  // Applied uniformly to both the sync and worker branches — see the
  // security note in `markdown-workspace-render.ts` about why the worker
  // can't sanitize its own output.
  protected readonly sanitizedHtml = computed(() => DOMPurify.sanitize(this.result()?.renderedHtmlRaw ?? ''));

  // Angular's own [innerHTML] sanitizer strips elements outside its safe-elements
  // allowlist — notably `<input>`, needed for GFM task-list checkboxes — even
  // from already-sanitized HTML. bypassSecurityTrustHtml() is the correct escape
  // hatch specifically for "I've already sanitized this myself" (via DOMPurify
  // above), not a way to skip sanitization.
  protected readonly safeHtml = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.sanitizedHtml()));

  protected readonly frontMatterEntries = computed(() => {
    const frontMatter = this.result()?.frontMatter;
    return frontMatter ? Object.entries(frontMatter) : [];
  });

  private isSyncingScroll = false;

  constructor() {
    effect((onCleanup) => {
      const source = this.source();
      if (source.length <= WORKER_THRESHOLD) {
        this.jobSignal.set(null);
        return;
      }

      const payload: MarkdownWorkspacePayload = { source };
      const job = this.workerClient.run<MarkdownWorkspacePayload, WorkspaceRenderResult>(
        () => new Worker(new URL('./markdown-workspace.worker', import.meta.url), { type: 'module' }),
        payload,
      );
      this.jobSignal.set(job);
      onCleanup(() => job.cancel());
    });
  }

  protected onSourceInput(event: Event): void {
    this.source.set((event.target as HTMLTextAreaElement).value);
  }

  protected onRatioChange(ratio: number): void {
    this.paneRatio.set(ratio);
  }

  protected toggleToc(): void {
    this.showToc.set(!this.showToc());
  }

  protected toggleFrontMatterPanel(): void {
    this.showFrontMatterPanel.set(!this.showFrontMatterPanel());
  }

  protected toggleSyncScroll(): void {
    this.syncScroll.set(!this.syncScroll());
  }

  protected insert(action: MarkdownInsertAction): void {
    const textarea = this.sourceTextarea()?.nativeElement;
    if (!textarea) return;

    const result = applyMarkdownInsertion(this.source(), textarea.selectionStart, textarea.selectionEnd, action);
    this.source.set(result.text);

    queueMicrotask(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  protected formatFrontMatterValue(value: unknown): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  protected scrollToHeading(slug: string): void {
    this.previewPane()?.nativeElement.querySelector(`#${CSS.escape(slug)}`)?.scrollIntoView({ block: 'start' });
  }

  protected onSourceScroll(event: Event): void {
    if (!this.syncScroll() || this.isSyncingScroll) return;
    const source = event.target as HTMLTextAreaElement;
    const preview = this.previewPane()?.nativeElement;
    if (!preview) return;

    const targetTop = computeSyncedScrollTop(
      source.scrollTop,
      source.scrollHeight,
      source.clientHeight,
      preview.scrollHeight,
      preview.clientHeight,
    );
    this.isSyncingScroll = true;
    preview.scrollTop = targetTop;
    queueMicrotask(() => (this.isSyncingScroll = false));
  }

  protected onPreviewScroll(event: Event): void {
    if (!this.syncScroll() || this.isSyncingScroll) return;
    const preview = event.target as HTMLDivElement;
    const source = this.sourceTextarea()?.nativeElement;
    if (!source) return;

    const targetTop = computeSyncedScrollTop(
      preview.scrollTop,
      preview.scrollHeight,
      preview.clientHeight,
      source.scrollHeight,
      source.clientHeight,
    );
    this.isSyncingScroll = true;
    source.scrollTop = targetTop;
    queueMicrotask(() => (this.isSyncingScroll = false));
  }

  protected copyHtml(): void {
    void navigator.clipboard.writeText(this.sanitizedHtml());
  }

  protected downloadHtml(): void {
    downloadFile(new TextEncoder().encode(this.sanitizedHtml()), 'document.html', 'text/html');
  }

  protected clear(): void {
    this.source.set('');
  }
}
