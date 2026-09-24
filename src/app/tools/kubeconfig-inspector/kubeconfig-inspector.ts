import { Component, computed, inject, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { inspectKubeconfig, redactSecret, type KubeconfigUser } from './kubeconfig-inspector-logic';

@Component({
  selector: 'app-kubeconfig-inspector',
  imports: [ToolShell, ErrorPanel],
  templateUrl: './kubeconfig-inspector.html',
})
export class KubeconfigInspector {
  private readonly persistence = inject(PersistenceService);

  protected readonly input = this.persistence.signal('kubeconfig-inspector', 'input', 'none', '');
  protected readonly revealed = signal(false);

  protected readonly result = computed(() => (this.input().trim() === '' ? null : inspectKubeconfig(this.input())));

  protected onInput(event: Event): void {
    this.input.set((event.target as HTMLTextAreaElement).value);
  }

  protected toggleRevealed(): void {
    this.revealed.update((value) => !value);
  }

  protected displaySecret(value: string): string {
    return this.revealed() ? value : redactSecret(value);
  }

  protected secretEntries(user: KubeconfigUser): readonly (readonly [string, string])[] {
    return Object.entries(user.secretFields);
  }
}
