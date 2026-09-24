import { Component, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { inspectIpAddress } from './ip-address-inspector-logic';

@Component({
  selector: 'app-ip-address-inspector',
  imports: [ToolShell, ErrorPanel],
  templateUrl: './ip-address-inspector.html',
})
export class IpAddressInspector {
  private readonly persistence = inject(PersistenceService);

  protected readonly input = this.persistence.signal('ip-address-inspector', 'input', 'session', '192.168.1.1');

  protected readonly result = computed(() => (this.input().trim() === '' ? null : inspectIpAddress(this.input())));

  protected onInput(event: Event): void {
    this.input.set((event.target as HTMLInputElement).value);
  }
}
