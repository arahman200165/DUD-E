import { Component, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { CopyButton } from '../../shared/components/copy-button/copy-button';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { convertEnvJson, type EnvJsonDirection } from './env-json-converter-logic';

@Component({
  selector: 'app-env-json-converter',
  imports: [ToolShell, ErrorPanel, CopyButton],
  templateUrl: './env-json-converter.html',
})
export class EnvJsonConverter {
  private readonly persistence = inject(PersistenceService);

  protected readonly direction = this.persistence.signal<EnvJsonDirection>('env-json-converter', 'direction', 'local', 'env-to-json');
  protected readonly input = this.persistence.signal('env-json-converter', 'input', 'session', 'FOO=bar\nPORT=8080\n');

  protected readonly result = computed(() => convertEnvJson(this.input(), this.direction()));

  protected setDirection(direction: EnvJsonDirection): void {
    this.direction.set(direction);
  }

  protected onInput(event: Event): void {
    this.input.set((event.target as HTMLTextAreaElement).value);
  }
}
