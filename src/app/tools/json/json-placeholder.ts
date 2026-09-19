import { Component } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';

@Component({
  selector: 'app-json-placeholder',
  imports: [ToolShell],
  template: `
    <app-tool-shell title="JSON Formatter">
      <p class="text-sm text-text-muted">
        This is the reserved <span class="font-mono text-cat-data">/tools/json</span> workspace route.
        The real formatter/validator arrives in Milestone 8 — this placeholder only proves the tool
        workspace frame and lazy-loaded routing work end to end.
      </p>
    </app-tool-shell>
  `,
})
export class JsonPlaceholder {}
