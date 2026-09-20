import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { BusyIndicator, BusyIndicatorStatus } from '../../shared/components/busy-indicator/busy-indicator';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { CodeSandboxHost } from '../../shared/code-sandbox/code-sandbox-host';
import { EMPTY_JS_PLAYGROUND_STATE, JsPlaygroundState, applySandboxEvent } from './js-playground-session';

const DEFAULT_SNIPPET = "console.log('Hello from the JS Playground!');\n1 + 1;";
const DEFAULT_TIMEOUT_MS = 3000;

@Component({
  selector: 'app-js-playground',
  imports: [ToolShell, ErrorPanel, BusyIndicator, CodeSandboxHost],
  templateUrl: './js-playground.html',
})
export class JsPlayground {
  private readonly persistence = inject(PersistenceService);

  protected readonly code = this.persistence.signal('js-playground', 'code', 'session', DEFAULT_SNIPPET);
  protected readonly timeoutMs = this.persistence.signal('js-playground', 'timeoutMs', 'local', DEFAULT_TIMEOUT_MS);

  private readonly sandboxHost = viewChild.required(CodeSandboxHost);
  private activeRun: { requestId: string; cancel(): void } | null = null;

  protected readonly state = signal<JsPlaygroundState>(EMPTY_JS_PLAYGROUND_STATE);
  protected readonly running = signal(false);

  protected readonly status = computed<BusyIndicatorStatus>(() => {
    if (this.running()) return 'running';
    const outcome = this.state().outcome;
    if (!outcome) return 'idle';
    if (outcome.kind === 'error') return 'error';
    if (outcome.kind === 'terminated' && outcome.reason !== 'cancelled') return 'error';
    if (outcome.kind === 'terminated') return 'cancelled';
    return 'done';
  });

  protected onCodeChange(event: Event): void {
    this.code.set((event.target as HTMLTextAreaElement).value);
  }

  protected run(): void {
    this.state.set(EMPTY_JS_PLAYGROUND_STATE);
    this.running.set(true);
    this.activeRun = this.sandboxHost().run(this.code(), this.timeoutMs(), (event) => {
      this.state.update((state) => applySandboxEvent(state, event));
      if (event.kind !== 'log') this.running.set(false);
    });
  }

  protected stop(): void {
    this.activeRun?.cancel();
  }

  protected clear(): void {
    this.code.set('');
    this.state.set(EMPTY_JS_PLAYGROUND_STATE);
  }
}
