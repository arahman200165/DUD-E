import { Component, computed, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { SplitPane } from '../../shared/components/split-pane/split-pane';
import { KeyValueEditor } from '../../shared/components/key-value-editor/key-value-editor';
import { CopyButton } from '../../shared/components/copy-button/copy-button';
import { KeyValuePair } from '../../shared/models/key-value-pair.model';
import { buildHeaders, parseHeaders } from './http-headers-codec';
import { describeHeader } from './well-known-headers';

/**
 * Deliberately does NOT inject PersistenceService — pasted headers routinely
 * carry Authorization/Cookie values (PRD Section 14.1/30), so this tool
 * follows the same "no automatic persistence" pattern as the JWT Debugger.
 */
@Component({
  selector: 'app-http-header-inspector',
  imports: [ToolShell, SplitPane, KeyValueEditor, CopyButton],
  templateUrl: './http-header-inspector.html',
})
export class HttpHeaderInspector {
  protected readonly raw = signal('');
  protected readonly pairs = computed(() => parseHeaders(this.raw()));
  protected readonly describeHeader = describeHeader;

  protected onRawChange(event: Event): void {
    this.raw.set((event.target as HTMLTextAreaElement).value);
  }

  protected onPairsChange(pairs: readonly KeyValuePair[]): void {
    this.raw.set(buildHeaders(pairs));
  }

  protected clear(): void {
    this.raw.set('');
  }
}
