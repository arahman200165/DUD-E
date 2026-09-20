import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { buildSandboxedMarkdownDocument } from './sandboxed-markdown-preview-doc';

/**
 * Renders already-sanitized Markdown HTML plus user-authored custom CSS
 * inside a bare `<iframe sandbox="">` (no `allow-scripts`/`allow-same-
 * origin`) — used only when custom CSS is active; the normal in-page
 * `[innerHTML]` render stays in use for fixed, developer-authored style
 * presets, which carry zero injection risk.
 *
 * Known, disclosed tradeoff: scroll-sync and TOC-click-to-scroll (Markdown
 * Workspace) read/write the preview element's scroll position directly —
 * impossible across this iframe boundary without a postMessage bridge, so
 * those features are unavailable while this component is in use.
 */
@Component({
  selector: 'app-sandboxed-markdown-preview',
  template: `<iframe [srcdoc]="srcdoc()" sandbox="" class="h-full w-full border-0 bg-panel"></iframe>`,
})
export class SandboxedMarkdownPreview {
  private readonly sanitizer = inject(DomSanitizer);

  readonly html = input.required<string>();
  readonly css = input('');

  protected readonly srcdoc = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(buildSandboxedMarkdownDocument(this.html(), this.css())),
  );
}
