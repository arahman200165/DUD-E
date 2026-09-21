import { XmlCsvDirection } from './xml-csv-transform';

export interface XmlCsvPayload {
  readonly input: string;
  readonly direction: XmlCsvDirection;
  readonly recordElement: string;
}
