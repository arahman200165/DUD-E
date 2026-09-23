import { Component, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { CopyButton } from '../../shared/components/copy-button/copy-button';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { findClosestTailwindColors } from './tailwind-color-matcher-logic';

@Component({
  selector: 'app-tailwind-color-matcher',
  imports: [ToolShell, ErrorPanel, CopyButton],
  templateUrl: './tailwind-color-matcher.html',
})
export class TailwindColorMatcher {
  private readonly persistence = inject(PersistenceService);

  protected readonly input = this.persistence.signal('tailwind-color-matcher', 'input', 'session', '#3b82f6');

  protected readonly result = computed(() => findClosestTailwindColors(this.input(), 8));

  protected onInputChange(event: Event): void {
    this.input.set((event.target as HTMLInputElement).value);
  }
}
