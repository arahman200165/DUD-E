import { HashAlgorithm } from './hash-compute';

export interface HashComputePayload {
  readonly text: string;
  readonly algorithms: readonly HashAlgorithm[];
}
