import { CsvJoinType } from './csv-join-transform';

export interface CsvJoinPayload {
  readonly leftInput: string;
  readonly rightInput: string;
  readonly leftKey: string;
  readonly rightKey: string;
  readonly joinType: CsvJoinType;
}
