import { CsvPivotAggregation } from './csv-pivot-transform';

export interface CsvPivotPayload {
  readonly input: string;
  readonly rowKeyColumn: string;
  readonly columnKeyColumn: string;
  readonly valueColumn: string;
  readonly aggregation: CsvPivotAggregation;
}
