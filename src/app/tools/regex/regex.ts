import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { BusyIndicator } from '../../shared/components/busy-indicator/busy-indicator';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { WorkerClientService } from '../../core/workers/worker-client.service';
import { WorkerJob } from '../../core/workers/worker-job';
import { RegexMatchResult } from './regex-match';
import { RegexMatchPayload } from './regex-match-payload';

const FLAG_CHARS = ['g', 'i', 'm', 's', 'u', 'y'] as const;

/** A pattern can only be stopped by terminating its worker, so auto-cancel a run that hangs this long. */
const AUTO_TIMEOUT_MS = 3000;

@Component({
  selector: 'app-regex',
  imports: [ToolShell, BusyIndicator, ErrorPanel],
  templateUrl: './regex.html',
})
export class Regex implements OnDestroy {
  private readonly persistence = inject(PersistenceService);
  private readonly workerClient = inject(WorkerClientService);
  private timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  protected readonly flagChars = FLAG_CHARS;

  protected readonly pattern = this.persistence.signal('regex', 'pattern', 'session', '');
  protected readonly testText = this.persistence.signal('regex', 'testText', 'session', '');
  protected readonly flags = this.persistence.signal('regex', 'flags', 'local', 'g');

  protected readonly job = signal<WorkerJob<RegexMatchResult> | null>(null);

  protected readonly summary = computed(() => {
    const result = this.job()?.result();
    if (!result?.ok) return null;
    return `${result.matches.length} match${result.matches.length === 1 ? '' : 'es'}`;
  });

  protected hasFlag(flag: string): boolean {
    return this.flags().includes(flag);
  }

  protected toggleFlag(flag: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.flags();
    this.flags.set(checked ? current + flag : current.replace(flag, ''));
  }

  protected onPatternInput(event: Event): void {
    this.pattern.set((event.target as HTMLInputElement).value);
  }

  protected onTestTextInput(event: Event): void {
    this.testText.set((event.target as HTMLTextAreaElement).value);
  }

  protected run(): void {
    this.job()?.cancel();
    if (this.timeoutHandle !== undefined) clearTimeout(this.timeoutHandle);

    if (this.pattern() === '') {
      this.job.set(null);
      return;
    }

    const payload: RegexMatchPayload = { pattern: this.pattern(), flags: this.flags(), testText: this.testText() };
    const job = this.workerClient.run<RegexMatchPayload, RegexMatchResult>(
      () => new Worker(new URL('./regex-match.worker', import.meta.url), { type: 'module' }),
      payload,
    );
    this.job.set(job);
    this.timeoutHandle = setTimeout(() => job.cancel(), AUTO_TIMEOUT_MS);
  }

  protected cancel(): void {
    this.job()?.cancel();
  }

  ngOnDestroy(): void {
    this.job()?.cancel();
    if (this.timeoutHandle !== undefined) clearTimeout(this.timeoutHandle);
  }
}
