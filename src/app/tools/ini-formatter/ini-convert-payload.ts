import { IniDirection } from './ini-convert';

export interface IniConvertPayload {
  readonly input: string;
  readonly direction: IniDirection;
}
