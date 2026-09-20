import { QueryLanguage } from './json-query-eval';

export interface JsonQueryPayload {
  readonly jsonInput: string;
  readonly query: string;
  readonly language: QueryLanguage;
}
