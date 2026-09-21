import { JsonMergeStrategy } from './json-merge-transform';

export interface JsonMergePayload {
  readonly baseInput: string;
  readonly overlayInput: string;
  readonly strategy: JsonMergeStrategy;
}
