/**
 * Builds the document rendered inside the CSS playground/generator tools'
 * (Box Shadow, Border Radius, Cubic-Bezier, CSS Transform, CSS Animation,
 * Flexbox, CSS Grid) live-preview iframe. Unlike `live-html-preview-doc.ts`
 * (HTML Preview), nothing here ever needs to run a `<script>` — these tools
 * render user-authored CSS against app-provided or user-edited *markup*
 * structure, never arbitrary logic — so the CSP is locked down further
 * (`script-src 'none'`) and the iframe's `sandbox` attribute carries no
 * `allow-scripts` token at all, the most restrictive setting available.
 */
export function buildCssPreviewDoc(css: string, html: string): string {
  return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none';">
<style>${css}</style>
${html}`;
}
