export type DiffGranularity = 'line' | 'char' | 'word';

export interface AdvancedDiffPayload {
  readonly left: string;
  readonly right: string;
  readonly granularity: DiffGranularity;
}
