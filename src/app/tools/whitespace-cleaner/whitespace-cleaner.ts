import { Component, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { DEFAULT_WHITESPACE_OPTIONS, TabConversion, WhitespaceCleanOptions, cleanWhitespace } from './whitespace-clean';

@Component({
  selector: 'app-whitespace-cleaner',
  imports: [ToolShell],
  templateUrl: './whitespace-cleaner.html',
})
export class WhitespaceCleaner {
  private readonly persistence = inject(PersistenceService);

  protected readonly input = this.persistence.signal('whitespace-cleaner', 'input', 'session', '');
  protected readonly options = this.persistence.signal<WhitespaceCleanOptions>(
    'whitespace-cleaner',
    'options',
    'local',
    DEFAULT_WHITESPACE_OPTIONS,
  );

  protected readonly result = computed(() => cleanWhitespace(this.input(), this.options()));

  protected onInputChange(event: Event): void {
    this.input.set((event.target as HTMLTextAreaElement).value);
  }

  protected toggle(key: keyof Omit<WhitespaceCleanOptions, 'tabConversion' | 'tabWidth'>): void {
    this.options.update((current) => ({ ...current, [key]: !current[key] }));
  }

  protected onTabConversionChange(event: Event): void {
    const tabConversion = (event.target as HTMLSelectElement).value as TabConversion;
    this.options.update((current) => ({ ...current, tabConversion }));
  }

  protected onTabWidthChange(event: Event): void {
    const tabWidth = Number((event.target as HTMLInputElement).value) || 1;
    this.options.update((current) => ({ ...current, tabWidth }));
  }

  protected clear(): void {
    this.input.set('');
  }

  protected copy(): void {
    void navigator.clipboard.writeText(this.result());
  }
}
