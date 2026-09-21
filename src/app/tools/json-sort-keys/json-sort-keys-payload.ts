import { SortOrder } from './json-sort-keys-transform';

export interface JsonSortKeysPayload {
  readonly input: string;
  readonly recursive: boolean;
  readonly order: SortOrder;
}
