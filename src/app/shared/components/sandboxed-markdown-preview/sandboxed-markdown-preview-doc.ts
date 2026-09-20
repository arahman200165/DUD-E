/**
 * Builds the `srcdoc` document for `SandboxedMarkdownPreview`. Pure so the
 * document-assembly logic is testable without an iframe/DOM.
 *
 * The iframe boundary — not a CSS parser — is the real isolation
 * mechanism: rather than hand-rolling a CSS property/value allowlist
 * parser (CSS has enough edge cases — nested at-rules, comments hiding
 * `@import`, encoded `url()` — that a partial parser would give a false
 * sense of security), custom CSS is rendered inside a bare
 * `<iframe sandbox="">` with no `allow-scripts`/`allow-same-origin`, plus
 * an internal CSP meta tag as defense-in-depth.
 */
export function buildSandboxedMarkdownDocument(html: string, css: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: blob: https:;">
<style>
  :root { color-scheme: dark; }
  body { margin: 0; padding: 0.75rem; background: transparent; color: #e5e5e5; font-family: sans-serif; }
</style>
<style>${css}</style>
</head>
<body class="markdown-body">${html}</body>
</html>`;
}
