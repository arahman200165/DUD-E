import { EntropyReport } from './file-entropy-analyzer-logic';

export interface FileEntropyAnalyzerWorkerPayload {
  readonly buffer: ArrayBuffer;
  readonly windowSize: number;
}

export type FileEntropyAnalyzerWorkerResult = EntropyReport;
