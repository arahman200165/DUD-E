import { FileInspectorReport } from './file-inspector-logic';

export interface FileInspectorWorkerPayload {
  readonly buffer: ArrayBuffer;
  readonly fileName: string;
  readonly declaredMime: string | null;
}

export type FileInspectorWorkerResult = FileInspectorReport;
