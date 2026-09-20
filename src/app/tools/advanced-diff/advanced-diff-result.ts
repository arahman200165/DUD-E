import { DiffResult } from '../diff/text-diff';
import { FineDiffResult } from './char-word-diff';
import { ThreeWayMergeResult } from './three-way-merge';

export interface AdvancedDiffResult {
  /** Always computed — the merge view and unified-diff export are both line-oriented, even in char/word display mode. */
  readonly lineDiff: DiffResult;
  /** Present only when `granularity` is `'char'` or `'word'` — a display-only refinement over the line diff. */
  readonly fineDiff?: FineDiffResult;
  /** Present only when the request included a `base` — three-way merge hunks. */
  readonly threeWayMerge?: ThreeWayMergeResult;
}
