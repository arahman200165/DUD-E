import { Component, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { CopyButton } from '../../shared/components/copy-button/copy-button';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { CssFormatMode, formatCss } from './css-format-logic';

const SAMPLE_CSS = `.card {
  color: #111827;
  background: white;
}
.card, .card--compact { padding: 8px; }
@media (min-width: 768px) {
  .card { padding: 16px; }
}`;

@Component({
  selector: 'app-css-formatter',
  imports: [ToolShell, ErrorPanel, CopyButton],
  templateUrl: './css-formatter.html',
})
export class CssFormatter {
  private readonly persistence = inject(PersistenceService);

  protected readonly input = this.persistence.signal('css-formatter', 'input', 'session', SAMPLE_CSS);
  protected readonly mode = this.persistence.signal<CssFormatMode>('css-formatter', 'mode', 'local', 'pretty');

  protected readonly result = computed(() => formatCss(this.input(), this.mode()));

  protected onInputChange(event: Event): void {
    this.input.set((event.target as HTMLTextAreaElement).value);
  }

  protected setMode(mode: CssFormatMode): void {
    this.mode.set(mode);
  }
}
