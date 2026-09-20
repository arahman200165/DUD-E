import { Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { SplitPane } from '../../shared/components/split-pane/split-pane';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { renderMarkdown } from './markdown-render';

const DEFAULT_SOURCE = '# Markdown Preview\n\nType **Markdown** on the left to see it rendered on the right.\n';

@Component({
  selector: 'app-markdown',
  imports: [ToolShell, SplitPane],
  templateUrl: './markdown.html',
  // Emulated encapsulation (the default) adds a scoping attribute to
  // elements the Angular template compiler renders, but never to content
  // injected via [innerHTML] — that's raw HTML parsed directly into the
  // DOM, so these `.markdown-body` rules never actually matched the
  // rendered Markdown (verified: the <pre> background was always
  // transparent). Discovered while building the Advanced Markdown
  // Workspace tool, which hit the identical issue.
  encapsulation: ViewEncapsulation.None,
  styles: `
    .markdown-body :first-child {
      margin-top: 0;
    }
    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3 {
      font-weight: 600;
      margin: 0.75em 0 0.4em;
    }
    .markdown-body p,
    .markdown-body ul,
    .markdown-body ol,
    .markdown-body pre,
    .markdown-body blockquote {
      margin: 0.5em 0;
    }
    .markdown-body ul,
    .markdown-body ol {
      padding-left: 1.4em;
    }
    .markdown-body code {
      font-family: var(--font-mono);
      background: var(--color-panel-elevated);
      border-radius: 2px;
      padding: 0.1em 0.3em;
      font-size: 0.9em;
    }
    .markdown-body pre {
      background: var(--color-panel-elevated);
      border-radius: 4px;
      padding: 0.6em 0.8em;
      overflow: auto;
    }
    .markdown-body pre code {
      background: none;
      padding: 0;
    }
    .markdown-body blockquote {
      border-left: 2px solid var(--color-border);
      padding-left: 0.8em;
      color: var(--color-text-muted);
    }
    .markdown-body a {
      color: var(--color-accent);
    }
  `,
})
export class Markdown {
  private readonly persistence = inject(PersistenceService);

  protected readonly source = this.persistence.signal('markdown', 'source', 'session', DEFAULT_SOURCE);
  protected readonly paneRatio = this.persistence.signal('markdown', 'paneRatio', 'local', 0.5);

  protected readonly renderedHtml = computed(() => renderMarkdown(this.source()));

  protected onSourceInput(event: Event): void {
    this.source.set((event.target as HTMLTextAreaElement).value);
  }

  protected onRatioChange(ratio: number): void {
    this.paneRatio.set(ratio);
  }

  protected clear(): void {
    this.source.set('');
  }

  protected copySource(): void {
    void navigator.clipboard.writeText(this.source());
  }
}
