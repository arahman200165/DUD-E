import { FlattenDirection } from './json-flatten-transform';

export interface JsonFlattenPayload {
  readonly input: string;
  readonly direction: FlattenDirection;
}
