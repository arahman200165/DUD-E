import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { BusyIndicator } from '../../shared/components/busy-indicator/busy-indicator';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { WorkerClientService } from '../../core/workers/worker-client.service';
import { WorkerJob } from '../../core/workers/worker-job';
import { RegexMatchResult, RegexReplaceResult } from './regex-match';
import { RegexWorkerPayload } from './regex-match-payload';
import { explainRegex, RegexExplainResult } from './regex-explain';
import { flavorNotesFor, REGEX_FLAVORS, type RegexFlavor } from './regex-flavor-notes';

const FLAG_CHARS = ['g', 'i', 'm', 's', 'u', 'y'] as const;

export type RegexMode = 'match' | 'replace';

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
  protected readonly flavors = Object.entries(REGEX_FLAVORS) as [RegexFlavor, string][];

  protected readonly pattern = this.persistence.signal('regex', 'pattern', 'session', '');
  protected readonly testText = this.persistence.signal('regex', 'testText', 'session', '');
  protected readonly flags = this.persistence.signal('regex', 'flags', 'local', 'g');
  protected readonly mode = this.persistence.signal<RegexMode>('regex', 'mode', 'local', 'match');
  protected readonly replacement = this.persistence.signal('regex', 'replacement', 'session', '');
  protected readonly flavor = this.persistence.signal<RegexFlavor>('regex', 'flavor', 'local', 'js');

  protected readonly showExplain = signal(false);

  protected readonly job = signal<WorkerJob<RegexMatchResult | RegexReplaceResult> | null>(null);

  protected readonly summary = computed(() => {
    const result = this.job()?.result();
    if (!result?.ok) return null;
    if ('matches' in result) return `${result.matches.length} match${result.matches.length === 1 ? '' : 'es'}`;
    return null;
  });

  protected readonly explainResult = computed<RegexExplainResult | null>(() => {
    if (!this.showExplain() || this.pattern() === '') return null;
    return explainRegex(this.pattern(), this.flags());
  });

  protected readonly flavorNotes = computed(() => flavorNotesFor(this.pattern(), this.flags(), this.flavor()));

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

  protected onReplacementInput(event: Event): void {
    this.replacement.set((event.target as HTMLInputElement).value);
  }

  protected setMode(mode: RegexMode): void {
    this.mode.set(mode);
  }

  protected onFlavorChange(event: Event): void {
    this.flavor.set((event.target as HTMLSelectElement).value as RegexFlavor);
  }

  protected toggleExplain(): void {
    this.showExplain.set(!this.showExplain());
  }

  protected run(): void {
    this.job()?.cancel();
    if (this.timeoutHandle !== undefined) clearTimeout(this.timeoutHandle);

    if (this.pattern() === '') {
      this.job.set(null);
      return;
    }

    const payload: RegexWorkerPayload =
      this.mode() === 'replace'
        ? { kind: 'replace', pattern: this.pattern(), flags: this.flags(), testText: this.testText(), replacement: this.replacement() }
        : { kind: 'match', pattern: this.pattern(), flags: this.flags(), testText: this.testText() };

    const job = this.workerClient.run<RegexWorkerPayload, RegexMatchResult | RegexReplaceResult>(
      () => new Worker(new URL('./regex-match.worker', import.meta.url), { type: 'module' }),
      payload,
    );
    this.job.set(job);
    this.timeoutHandle = setTimeout(() => job.cancel(), AUTO_TIMEOUT_MS);
  }

  protected cancel(): void {
    this.job()?.cancel();
  }

  protected copy(text: string): void {
    void navigator.clipboard.writeText(text);
  }

  ngOnDestroy(): void {
    this.job()?.cancel();
    if (this.timeoutHandle !== undefined) clearTimeout(this.timeoutHandle);
  }
}
