import { HashAlgorithm } from '../hash/hash-compute';

export interface FileHashPayload {
  readonly buffer: ArrayBuffer;
  readonly algorithms: readonly HashAlgorithm[];
}
