import { Component, computed, effect, inject, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { BusyIndicator } from '../../shared/components/busy-indicator/busy-indicator';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { TreeView } from '../../shared/components/tree-view/tree-view';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { WorkerClientService } from '../../core/workers/worker-client.service';
import { WorkerJob } from '../../core/workers/worker-job';
import { JsonFormatResult, JsonIndent, JsonMode, processJson } from './json-format';
import { JsonFormatPayload } from './json-format-payload';
import { buildJsonTree, toTreeNode } from './json-tree';

/** Inputs above this size run in a Worker instead of blocking the main thread. */
const WORKER_THRESHOLD = 50_000;

export type JsonView = 'text' | 'tree';

@Component({
  selector: 'app-json',
  imports: [ToolShell, BusyIndicator, ErrorPanel, TreeView],
  templateUrl: './json.html',
})
export class Json {
  private readonly persistence = inject(PersistenceService);
  private readonly workerClient = inject(WorkerClientService);

  protected readonly input = this.persistence.signal('json', 'input', 'session', '');
  protected readonly mode = this.persistence.signal<JsonMode>('json', 'mode', 'local', 'pretty');
  protected readonly indent = this.persistence.signal<JsonIndent>('json', 'indent', 'local', 2);
  protected readonly view = this.persistence.signal<JsonView>('json', 'view', 'local', 'text');

  protected readonly usesWorker = computed(() => this.input().length > WORKER_THRESHOLD);
  protected readonly showTreeToggle = computed(() => !this.usesWorker());

  protected readonly treeResult = computed<{ ok: true; node: ReturnType<typeof toTreeNode> } | { ok: false; error: string } | null>(
    () => {
      if (!this.showTreeToggle() || this.view() !== 'tree' || this.input().trim() === '') return null;

      try {
        const parsed: unknown = JSON.parse(this.input());
        return { ok: true, node: toTreeNode(buildJsonTree(parsed)) };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
  );
  private readonly jobSignal = signal<WorkerJob<JsonFormatResult> | null>(null);
  protected readonly job = this.jobSignal.asReadonly();

  private readonly syncResult = computed<JsonFormatResult | null>(() =>
    this.usesWorker() ? null : processJson(this.input(), this.mode(), this.indent()),
  );

  protected readonly result = computed<JsonFormatResult | null>(() =>
    this.usesWorker() ? (this.job()?.result() ?? null) : this.syncResult(),
  );

  constructor() {
    effect((onCleanup) => {
      const input = this.input();
      const mode = this.mode();
      const indent = this.indent();

      if (input.length <= WORKER_THRESHOLD) {
        this.jobSignal.set(null);
        return;
      }

      const payload: JsonFormatPayload = { input, mode, indent };
      const job = this.workerClient.run<JsonFormatPayload, JsonFormatResult>(
        () => new Worker(new URL('./json-format.worker', import.meta.url), { type: 'module' }),
        payload,
      );
      this.jobSignal.set(job);
      onCleanup(() => job.cancel());
    });
  }

  protected onInputChange(event: Event): void {
    this.input.set((event.target as HTMLTextAreaElement).value);
  }

  protected setMode(mode: JsonMode): void {
    this.mode.set(mode);
  }

  protected setView(view: JsonView): void {
    this.view.set(view);
  }

  protected onIndentChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.indent.set(value === 'tab' ? 'tab' : (Number(value) as JsonIndent));
  }

  protected clear(): void {
    this.input.set('');
  }

  protected copy(output: string): void {
    void navigator.clipboard.writeText(output);
  }
}
