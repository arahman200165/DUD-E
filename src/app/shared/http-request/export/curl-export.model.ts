import { ParsedHttpRequest } from '../http-request.model';
import { generateCSharp } from './curl-export-csharp';
import { generateFetch } from './curl-export-fetch';
import { generateGo } from './curl-export-go';
import { generateRawHttp } from './curl-export-http';
import { generateJava } from './curl-export-java';
import { generateNode } from './curl-export-node';
import { generatePowerShell } from './curl-export-powershell';
import { generatePython } from './curl-export-python';

export type ExportFormatId = 'fetch' | 'python' | 'http' | 'node' | 'csharp' | 'go' | 'powershell' | 'java';

export interface ExportFormat {
  readonly id: ExportFormatId;
  readonly label: string;
  readonly generate: (request: ParsedHttpRequest) => string;
}

export const EXPORT_FORMATS: readonly ExportFormat[] = [
  { id: 'fetch', label: 'JavaScript (fetch)', generate: generateFetch },
  { id: 'python', label: 'Python (requests)', generate: generatePython },
  { id: 'http', label: 'Raw HTTP/1.1', generate: generateRawHttp },
  { id: 'node', label: 'Node.js (axios)', generate: generateNode },
  { id: 'csharp', label: 'C# (HttpClient)', generate: generateCSharp },
  { id: 'go', label: 'Go (net/http)', generate: generateGo },
  { id: 'powershell', label: 'PowerShell (Invoke-RestMethod)', generate: generatePowerShell },
  { id: 'java', label: 'Java (HttpClient)', generate: generateJava },
];
