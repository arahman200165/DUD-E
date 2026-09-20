import { HashAlgorithm } from '../../../shared-logic/hash-compute';

export interface FileHashPayload {
  readonly buffer: ArrayBuffer;
  readonly algorithms: readonly HashAlgorithm[];
}
