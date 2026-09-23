import { Component, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { CopyButton } from '../../shared/components/copy-button/copy-button';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { ERROR_CODE_CATEGORIES, ERROR_CODES, ErrorCodeCategory } from './error-codes-data';
import { filterErrorCodes } from './error-codes-search';

@Component({
  selector: 'app-error-code-reference',
  imports: [ToolShell, CopyButton],
  templateUrl: './error-code-reference.html',
})
export class ErrorCodeReference {
  private readonly persistence = inject(PersistenceService);

  protected readonly categories = ERROR_CODE_CATEGORIES;

  protected readonly category = this.persistence.signal<ErrorCodeCategory>('error-code-reference', 'category', 'local', 'windows');
  protected readonly filterText = this.persistence.signal('error-code-reference', 'filterText', 'local', '');

  protected readonly results = computed(() => filterErrorCodes(ERROR_CODES, this.category(), this.filterText()));
  protected readonly totalInCategory = computed(() => ERROR_CODES.filter((entry) => entry.category === this.category()).length);

  protected setCategory(category: ErrorCodeCategory): void {
    this.category.set(category);
  }

  protected onFilterInput(event: Event): void {
    this.filterText.set((event.target as HTMLInputElement).value);
  }

  protected clear(): void {
    this.filterText.set('');
  }
}
