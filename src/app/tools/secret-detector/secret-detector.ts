import { Component, computed, inject, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { detectSecrets, redactMatch } from './secret-detector-logic';

@Component({
  selector: 'app-secret-detector',
  imports: [ToolShell],
  templateUrl: './secret-detector.html',
})
export class SecretDetector {
  private readonly persistence = inject(PersistenceService);

  protected readonly input = this.persistence.signal('secret-detector', 'input', 'none', '');
  protected readonly revealed = signal(false);

  protected readonly findings = computed(() => detectSecrets(this.input()));

  protected onInput(event: Event): void {
    this.input.set((event.target as HTMLTextAreaElement).value);
  }

  protected toggleRevealed(): void {
    this.revealed.update((value) => !value);
  }

  protected display(match: string): string {
    return this.revealed() ? match : redactMatch(match);
  }
}
