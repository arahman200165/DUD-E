import { Component, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { CopyButton } from '../../shared/components/copy-button/copy-button';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { htmlToJsx, jsxToHtml } from './html-jsx-logic';

type Direction = 'html-to-jsx' | 'jsx-to-html';

const SAMPLE_HTML = `<div class="card" tabindex="0">
  <label for="name">Name</label>
  <input type="text" id="name" style="color: red; font-size: 14px;">
</div>`;

@Component({
  selector: 'app-html-jsx-converter',
  imports: [ToolShell, ErrorPanel, CopyButton],
  templateUrl: './html-jsx-converter.html',
})
export class HtmlJsxConverter {
  private readonly persistence = inject(PersistenceService);

  protected readonly direction = this.persistence.signal<Direction>('html-jsx-converter', 'direction', 'local', 'html-to-jsx');
  protected readonly input = this.persistence.signal('html-jsx-converter', 'input', 'session', SAMPLE_HTML);

  protected readonly result = computed(() => (this.direction() === 'html-to-jsx' ? htmlToJsx(this.input()) : jsxToHtml(this.input())));

  protected onInputChange(event: Event): void {
    this.input.set((event.target as HTMLTextAreaElement).value);
  }

  protected setDirection(direction: Direction): void {
    this.direction.set(direction);
  }
}
