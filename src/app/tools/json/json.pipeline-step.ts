import { PipelineStep, PipelineStepResult, PipelineValue } from '../../shared/models/pipeline-step.model';
import { processJson } from './json-format';

/**
 * Pipeline-step adapter for the JSON Formatter tool. Until per-step params ship (DUDE_PRD.md
 * §21 Item 2, v1.1), this always parses+normalizes to a `json` value rather than exposing the
 * tool's minify/validate modes — representative of the worker-eligible tool shape (the
 * underlying transform is small enough here to run inline; a genuinely large-input step would
 * dispatch through `WorkerClientService.run()` exactly as `json.ts`'s component already does).
 */
export const pipelineStep: PipelineStep = {
  accepts: ['text', 'json'],
  produces: ['json'],
  async run(input: PipelineValue): Promise<PipelineStepResult> {
    const text = input.type === 'json' ? JSON.stringify(input.value) : input.type === 'text' ? input.value : null;
    if (text === null) {
      return { ok: false, error: { message: 'JSON Formatter expects text or JSON input.', kind: 'invalid-input' } };
    }

    const result = processJson(text, 'pretty', 2);
    if (!result.ok) {
      return { ok: false, error: { message: result.error.message, kind: 'invalid-input' } };
    }

    return { ok: true, output: { type: 'json', value: JSON.parse(result.output) } };
  },
};
