import { YamlPathLanguage } from './yaml-path-eval';

export interface YamlPathPayload {
  readonly yamlInput: string;
  readonly query: string;
  readonly language: YamlPathLanguage;
}
