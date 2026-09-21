import { TomlMode } from './toml-format';

export interface TomlFormatPayload {
  readonly input: string;
  readonly mode: TomlMode;
}
