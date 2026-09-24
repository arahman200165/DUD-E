import { Component, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { CopyButton } from '../../shared/components/copy-button/copy-button';
import { KeyValueEditor } from '../../shared/components/key-value-editor/key-value-editor';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { downloadFile } from '../../shared/utils/download-file';
import type { KeyValuePair } from '../../shared/models/key-value-pair.model';
import { parseEnv, serializeEnv } from './env-format';

@Component({
  selector: 'app-env-editor',
  imports: [ToolShell, CopyButton, KeyValueEditor],
  templateUrl: './env-editor.html',
})
export class EnvEditor {
  private readonly persistence = inject(PersistenceService);

  protected readonly rawText = this.persistence.signal('env-editor', 'raw', 'session', 'FOO=bar\nDATABASE_URL="postgres://localhost/app"\n');

  protected readonly pairs = computed(() => parseEnv(this.rawText()));

  protected onRawInput(event: Event): void {
    this.rawText.set((event.target as HTMLTextAreaElement).value);
  }

  protected onPairsChange(pairs: readonly KeyValuePair[]): void {
    this.rawText.set(serializeEnv(pairs));
  }

  protected download(): void {
    downloadFile(new Blob([this.rawText()]), '.env', 'text/plain');
  }
}
