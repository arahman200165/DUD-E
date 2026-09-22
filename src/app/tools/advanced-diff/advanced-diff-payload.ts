import { IgnoreOptions } from './diff-normalize';

export type DiffGranularity = 'line' | 'char' | 'word';

export interface AdvancedDiffPayload {
  readonly left: string;
  readonly right: string;
  readonly granularity: DiffGranularity;
  readonly ignoreOptions: IgnoreOptions;
  /** Present only in three-way merge mode — the common-ancestor text. */
  readonly base?: string;
}
