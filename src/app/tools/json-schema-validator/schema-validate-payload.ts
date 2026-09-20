import { SchemaDraftMode } from './schema-validate';

export interface SchemaValidatePayload {
  readonly schemaText: string;
  readonly instanceText: string;
  readonly draftMode: SchemaDraftMode;
}
