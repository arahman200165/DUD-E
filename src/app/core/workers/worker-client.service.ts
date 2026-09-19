import { Injectable, signal } from '@angular/core';
import { WorkerJob, WorkerJobStatus } from './worker-job';
import { WorkerRequestMessage, WorkerResponseMessage, toErrorPayload } from './worker-protocol';

let nextJobId = 0;

class WorkerJobHandle<TResult> implements WorkerJob<TResult> {
  private readonly statusSignal = signal<WorkerJobStatus>('running');
  private readonly progressSignal = signal<number | null>(null);
  private readonly resultSignal = signal<TResult | null>(null);
  private readonly errorSignal = signal<string | null>(null);

  readonly status = this.statusSignal.asReadonly();
  readonly progress = this.progressSignal.asReadonly();
  readonly result = this.resultSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor(private readonly terminateWorker: () => void) {}

  cancel(): void {
    if (this.statusSignal() !== 'running') return;
    this.statusSignal.set('cancelled');
    this.terminateWorker();
  }

  reportProgress(progress: number): void {
    if (this.statusSignal() === 'running') this.progressSignal.set(progress);
  }

  resolve(result: TResult): void {
    if (this.statusSignal() !== 'running') return;
    this.resultSignal.set(result);
    this.statusSignal.set('done');
    this.terminateWorker();
  }

  reject(message: string): void {
    if (this.statusSignal() !== 'running') return;
    this.errorSignal.set(message);
    this.statusSignal.set('error');
    this.terminateWorker();
  }
}

/**
 * Reusable worker execution layer (PRD Section 15/26.3). Spawns one fresh
 * `Worker` per submitted job and terminates it on completion, error, or
 * cancellation — no pooling, no shared state between jobs.
 *
 * Every failure mode (construction throwing, `postMessage` throwing, a
 * malformed response, the worker's own uncaught exception) is funneled into
 * the returned job's `error` signal instead of being rethrown, so a broken
 * worker can never surface as an unhandled exception/rejection that would
 * interrupt router navigation or zone change detection.
 */
@Injectable({ providedIn: 'root' })
export class WorkerClientService {
  run<TPayload, TResult>(createWorker: () => Worker, payload: TPayload): WorkerJob<TResult> {
    let worker: Worker | undefined;
    let terminated = false;

    const terminateWorker = () => {
      if (terminated) return;
      terminated = true;
      worker?.terminate();
    };

    const job = new WorkerJobHandle<TResult>(terminateWorker);

    try {
      worker = createWorker();
    } catch (error) {
      job.reject(toErrorPayload(error).message);
      return job;
    }

    const id = `worker-job-${++nextJobId}`;

    worker.onmessage = (event: MessageEvent<WorkerResponseMessage<TResult>>) => {
      try {
        const message = event.data;
        if (!message || message.id !== id) return;

        if (message.kind === 'progress') job.reportProgress(message.progress);
        else if (message.kind === 'result') job.resolve(message.result);
        else job.reject(message.error.message);
      } catch (handlingError) {
        job.reject(toErrorPayload(handlingError).message);
      }
    };

    worker.onerror = (event: ErrorEvent) => {
      event.preventDefault();
      job.reject(event.message || 'Worker terminated unexpectedly.');
    };

    try {
      const request: WorkerRequestMessage<TPayload> = { id, payload };
      worker.postMessage(request);
    } catch (error) {
      job.reject(toErrorPayload(error).message);
    }

    return job;
  }
}
