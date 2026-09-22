import { IgnoreOptions } from './diff-normalize';

export type DiffGranularity = 'line' | 'char' | 'word';

/** Orthogonal to `granularity`, which only applies when mode is `'text'`. */
export type DiffMode = 'text' | 'semantic-json' | 'semantic-yaml' | 'semantic-xml';

export interface AdvancedDiffPayload {
  readonly left: string;
  readonly right: string;
  readonly mode: DiffMode;
  readonly granularity: DiffGranularity;
  readonly ignoreOptions: IgnoreOptions;
  /** Present only in three-way merge mode — the common-ancestor text. */
  readonly base?: string;
}
