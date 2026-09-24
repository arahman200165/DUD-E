import { ByteFrequencyReport } from './byte-frequency-analyzer-logic';

export interface ByteFrequencyAnalyzerWorkerPayload {
  readonly buffer: ArrayBuffer;
}

export type ByteFrequencyAnalyzerWorkerResult = ByteFrequencyReport;
