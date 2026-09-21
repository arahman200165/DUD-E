/**
 * Shared vocabulary a tool declares its inputs/outputs in terms of, per DUDE_PRD.md §22's
 * "Universal Input/Output Contract" sketch. Declarative documentation only, like `persistence`/
 * `execution`/`network` on ToolDefinition -- not read by the shell at runtime. It exists so tools
 * agree on a common shape before anything (pipelines, Smart Paste) is built on top of it.
 */
export type DudeDataType =
  | 'text' // plain UTF-8 string
  | 'json' // structured JSON value (object/array/primitive)
  | 'bytes' // binary/Base64 payload without file metadata
  | 'file' // a File/Blob carrying a name + MIME type
  | 'table' // { columns, rows } tabular data
  | 'url' // a URL/URI string
  | 'http-response'; // reserved: no tool produces/consumes this yet (future HTTP client tool)

export interface ToolIOCapabilities {
  readonly accepts: readonly DudeDataType[];
  readonly produces: readonly DudeDataType[];
}
