import { HashAlgorithm } from '../../../shared-logic/hash-compute';

export interface HashComputePayload {
  readonly text: string;
  readonly algorithms: readonly HashAlgorithm[];
}
