import { Component, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { generateUuidV4, inspectUuid } from './uuid-tool';

@Component({
  selector: 'app-uuid',
  imports: [ToolShell, ErrorPanel],
  templateUrl: './uuid.html',
})
export class Uuid {
  private readonly persistence = inject(PersistenceService);

  protected readonly generated = this.persistence.signal<readonly string[]>('uuid', 'generated', 'session', []);
  protected readonly inspectInput = this.persistence.signal('uuid', 'inspect', 'session', '');

  protected readonly inspection = computed(() =>
    this.inspectInput() === '' ? null : inspectUuid(this.inspectInput()),
  );

  protected generate(): void {
    this.generated.update((list) => [generateUuidV4(), ...list].slice(0, 20));
  }

  protected clearGenerated(): void {
    this.generated.set([]);
  }

  protected onInspectInput(event: Event): void {
    this.inspectInput.set((event.target as HTMLInputElement).value);
  }

  protected copy(value: string): void {
    void navigator.clipboard.writeText(value);
  }
}
