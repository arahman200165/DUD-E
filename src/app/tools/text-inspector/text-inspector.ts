import { Component, computed, inject, signal } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { computeSelectionMetrics, computeTextMetrics } from './text-metrics';

interface Selection {
  readonly start: number;
  readonly end: number;
}

@Component({
  selector: 'app-text-inspector',
  imports: [ToolShell],
  templateUrl: './text-inspector.html',
})
export class TextInspector {
  private readonly persistence = inject(PersistenceService);

  protected readonly text = this.persistence.signal('text-inspector', 'text', 'session', '');
  protected readonly selection = signal<Selection>({ start: 0, end: 0 });

  protected readonly metrics = computed(() => computeTextMetrics(this.text()));
  protected readonly selectionMetrics = computed(() => {
    const { start, end } = this.selection();
    return computeSelectionMetrics(this.text(), start, end);
  });

  protected onTextInput(event: Event): void {
    this.text.set((event.target as HTMLTextAreaElement).value);
  }

  protected onSelectionChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.selection.set({ start: target.selectionStart, end: target.selectionEnd });
  }

  protected clear(): void {
    this.text.set('');
    this.selection.set({ start: 0, end: 0 });
  }
}
