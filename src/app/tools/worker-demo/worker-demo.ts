import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { BusyIndicator } from '../../shared/components/busy-indicator/busy-indicator';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { WorkerClientService } from '../../core/workers/worker-client.service';
import { WorkerJob } from '../../core/workers/worker-job';
import { TextFrequencyResult } from './text-frequency';
import { WorkerDemoPayload } from './worker-demo-payload';

const DEFAULT_TEXT = 'The quick brown fox jumps over the lazy dog. '.repeat(20);
const MAX_ANALYZED_LENGTH = 5_000_000;

/**
 * Builds the text to analyze without ever constructing a `base.repeat(n)`
 * string larger than `maxLength` — a naive `repeat` + `slice` would still
 * allocate the full, potentially huge, string on the main thread first.
 */
export function buildAnalysisText(base: string, repeatCount: number, maxLength: number): string {
  if (!base) return '';
  const safeRepeatCount = Math.max(1, Math.floor(repeatCount) || 1);
  const neededRepeats = Math.ceil(maxLength / base.length) + 1;
  const times = Math.min(safeRepeatCount, neededRepeats);
  return base.repeat(times).slice(0, maxLength);
}

@Component({
  selector: 'app-worker-demo',
  imports: [ToolShell, BusyIndicator, ErrorPanel],
  templateUrl: './worker-demo.html',
})
export class WorkerDemo implements OnDestroy {
  private readonly workerClient = inject(WorkerClientService);

  protected readonly text = signal(DEFAULT_TEXT);
  protected readonly repeatCount = signal(50);
  protected readonly triggerError = signal(false);
  protected readonly job = signal<WorkerJob<TextFrequencyResult> | null>(null);

  protected readonly topWordsLabel = computed(() => {
    const result = this.job()?.result();
    if (!result) return '';
    return result.topWords.map(([word, count]) => `${word} (${count})`).join(', ');
  });

  protected onTextInput(event: Event): void {
    this.text.set((event.target as HTMLTextAreaElement).value);
  }

  protected onRepeatCountInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.repeatCount.set(Number.isFinite(value) && value > 0 ? value : 1);
  }

  protected onTriggerErrorToggle(event: Event): void {
    this.triggerError.set((event.target as HTMLInputElement).checked);
  }

  protected run(): void {
    this.job()?.cancel();

    const payload: WorkerDemoPayload = {
      text: buildAnalysisText(this.text(), this.repeatCount(), MAX_ANALYZED_LENGTH),
      triggerError: this.triggerError(),
    };

    this.job.set(
      this.workerClient.run<WorkerDemoPayload, TextFrequencyResult>(
        () => new Worker(new URL('./worker-demo.worker', import.meta.url), { type: 'module' }),
        payload,
      ),
    );
  }

  protected cancel(): void {
    this.job()?.cancel();
  }

  ngOnDestroy(): void {
    this.job()?.cancel();
  }
}
