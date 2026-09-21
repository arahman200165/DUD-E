import { CsvCleanOptions } from './csv-clean';

export interface CsvCleanPayload {
  readonly input: string;
  readonly options: CsvCleanOptions;
}
