import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tool-shell',
  templateUrl: './tool-shell.html',
})
export class ToolShell {
  readonly title = input.required<string>();
  readonly status = input<'stable' | 'experimental'>('experimental');
}
