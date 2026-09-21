import { resolveJsonPointer } from './json-pointer-transform';

describe('resolveJsonPointer', () => {
  const doc = '{"a":{"b":1,"c":[10,20,30]},"d~e":true,"f/g":true}';

  it('resolves a nested object path', () => {
    expect(resolveJsonPointer(doc, '/a/b')).toEqual({ ok: true, output: '1' });
  });

  it('resolves an array index', () => {
    expect(resolveJsonPointer(doc, '/a/c/1')).toEqual({ ok: true, output: '20' });
  });

  it('unescapes ~0 and ~1 in reference tokens', () => {
    expect(resolveJsonPointer(doc, '/d~0e')).toEqual({ ok: true, output: 'true' });
    expect(resolveJsonPointer(doc, '/f~1g')).toEqual({ ok: true, output: 'true' });
  });

  it('resolves an empty-string key with a trailing slash', () => {
    expect(resolveJsonPointer('{"":42}', '/')).toEqual({ ok: true, output: '42' });
  });

  it('rejects empty JSON input', () => {
    expect(resolveJsonPointer('', '/a').ok).toBe(false);
  });

  it('rejects empty pointer input', () => {
    expect(resolveJsonPointer(doc, '').ok).toBe(false);
  });

  it('rejects a pointer that does not start with "/"', () => {
    expect(resolveJsonPointer(doc, 'a/b')).toEqual({ ok: false, error: { message: 'A JSON Pointer must start with "/".' } });
  });

  it('reports an out-of-bounds array index', () => {
    const result = resolveJsonPointer(doc, '/a/c/99');
    expect(result).toEqual({ ok: false, error: { message: 'Array index 99 is out of bounds.' } });
  });

  it('reports a missing property', () => {
    const result = resolveJsonPointer(doc, '/missing');
    expect(result).toEqual({ ok: false, error: { message: 'No property "missing" at this path.' } });
  });

  it('reports a parse error for malformed JSON', () => {
    const result = resolveJsonPointer('{"a": }', '/a');
    expect(result.ok).toBe(false);
  });
});
