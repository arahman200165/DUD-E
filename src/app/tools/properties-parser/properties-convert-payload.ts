import { PropertiesDirection } from './properties-convert';

export interface PropertiesConvertPayload {
  readonly input: string;
  readonly direction: PropertiesDirection;
}
