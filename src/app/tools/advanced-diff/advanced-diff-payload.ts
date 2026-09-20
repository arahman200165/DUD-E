export type DiffGranularity = 'line' | 'char' | 'word';

export interface AdvancedDiffPayload {
  readonly left: string;
  readonly right: string;
  readonly granularity: DiffGranularity;
  /** Present only in three-way merge mode — the common-ancestor text. */
  readonly base?: string;
}
