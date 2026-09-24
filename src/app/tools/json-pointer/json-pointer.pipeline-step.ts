import { PipelineStep, PipelineStepResult, PipelineValue } from '../../shared/models/pipeline-step.model';
import { resolveJsonPointer } from './json-pointer-transform';

/**
 * Pipeline-step adapter for the JSON Pointer Tester tool. The pointer is a small config value
 * alongside the flowing JSON document (like `csv-viewer`'s delimiter), not a second document —
 * fixed to `/0` (the first element of a top-level array/object-with-numeric-keys) since RFC 6901
 * has no pointer that resolves "the whole document" other than the empty string, which this
 * tool's own `resolveJsonPointer` explicitly rejects. Until per-step params ship (DUDE_PRD.md §21
 * Item 2, v1.1), a pipeline step cannot select a different pointer, so this will fail predictably
 * for documents with no `/0` member.
 */
const DEFAULT_POINTER = '/0';

export const pipelineStep: PipelineStep = {
  accepts: ['text', 'json'],
  produces: ['json'],
  async run(input: PipelineValue): Promise<PipelineStepResult> {
    const text = input.type === 'json' ? JSON.stringify(input.value) : input.type === 'text' ? input.value : null;
    if (text === null) {
      return { ok: false, error: { message: 'JSON Pointer Tester expects text or JSON input.', kind: 'invalid-input' } };
    }

    const result = resolveJsonPointer(text, DEFAULT_POINTER);
    if (!result.ok) {
      return { ok: false, error: { message: result.error.message, kind: 'invalid-input' } };
    }

    let value: unknown;
    try {
      value = JSON.parse(result.output);
    } catch {
      value = null;
    }
    return { ok: true, output: { type: 'json', value } };
  },
};
