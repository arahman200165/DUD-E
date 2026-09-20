import { buildSandboxedMarkdownDocument } from './sandboxed-markdown-preview-doc';

describe('buildSandboxedMarkdownDocument', () => {
  it('embeds the given HTML inside the body', () => {
    const doc = buildSandboxedMarkdownDocument('<p>hello</p>', '');
    expect(doc).toContain('<p>hello</p>');
  });

  it('embeds the given CSS inside a style tag', () => {
    const doc = buildSandboxedMarkdownDocument('<p>hello</p>', 'p { color: red; }');
    expect(doc).toContain('p { color: red; }');
  });

  it('includes a restrictive Content-Security-Policy meta tag', () => {
    const doc = buildSandboxedMarkdownDocument('', '');
    expect(doc).toContain('Content-Security-Policy');
    expect(doc).toContain("default-src 'none'");
  });

  it('applies the markdown-body class to the body element', () => {
    const doc = buildSandboxedMarkdownDocument('', '');
    expect(doc).toContain('<body class="markdown-body">');
  });
});
