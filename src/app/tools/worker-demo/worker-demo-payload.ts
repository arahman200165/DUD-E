/**
 * Kept separate from `worker-demo.worker.ts` so the main-thread component
 * never imports the worker file itself — the worker file is compiled under
 * `tsconfig.worker.json` (webworker lib), which conflicts with the DOM lib
 * used everywhere else in the app if pulled into the same TS program.
 */
export interface WorkerDemoPayload {
  readonly text: string;
  readonly triggerError: boolean;
}
