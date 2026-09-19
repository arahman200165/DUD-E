import { processJson } from './json-format';

describe('processJson', () => {
  it('pretty-prints with a 2-space indent', () => {
    const result = processJson('{"a":1,"b":[2,3]}', 'pretty', 2);

    expect(result).toEqual({ ok: true, output: '{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}' });
  });

  it('pretty-prints with a tab indent', () => {
    const result = processJson('{"a":1}', 'pretty', 'tab');

    expect(result).toEqual({ ok: true, output: '{\n\t"a": 1\n}' });
  });

  it('minifies formatted JSON', () => {
    const result = processJson('{\n  "a": 1\n}', 'minify', 2);

    expect(result).toEqual({ ok: true, output: '{"a":1}' });
  });

  it('validate mode returns the original input unchanged when valid', () => {
    const input = '{"a": 1}';
    expect(processJson(input, 'validate', 2)).toEqual({ ok: true, output: input });
  });

  it('rejects empty input', () => {
    expect(processJson('', 'pretty', 2).ok).toBe(false);
    expect(processJson('   ', 'pretty', 2).ok).toBe(false);
  });

  it('reports a parse error for malformed JSON', () => {
    const result = processJson('{"a": }', 'pretty', 2);

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.message.length > 0).toBe(true);
  });

  it('locates a line/column for a malformed JSON error when the engine reports a position', () => {
    const result = processJson('{\n  "a": ,\n}', 'pretty', 2);

    expect(result.ok).toBe(false);
    if (!result.ok && result.error.line !== undefined) {
      expect(result.error.line).toBeGreaterThan(0);
      expect(result.error.column).toBeGreaterThan(0);
    }
  });
});
