import { JsonIndent, YamlDirection } from './yaml-convert';

export interface YamlConvertPayload {
  readonly input: string;
  readonly direction: YamlDirection;
  readonly indent: JsonIndent;
}
