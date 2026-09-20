import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORY_METADATA, ToolCategory, TOOL_CATEGORIES } from '../../shared/models/tool-category.model';
import { ToolDefinition } from '../../shared/models/tool-definition.model';
import { ToolRegistryService } from '../../core/registry/tool-registry.service';
import { CategoryIcon } from '../../shared/components/category-icon/category-icon';

@Component({
  selector: 'app-deck',
  imports: [RouterLink, CategoryIcon],
  templateUrl: './deck.html',
})
export class Deck {
  private readonly registry = inject(ToolRegistryService);

  protected readonly meta = CATEGORY_METADATA;
  protected readonly query = signal('');

  private readonly isFiltering = computed(() => this.query().trim().length > 0);

  private readonly filteredGrouped = computed(() => {
    const results = this.registry.search(this.query());
    const grouped = new Map<ToolCategory, ToolDefinition[]>();
    for (const tool of results) {
      const bucket = grouped.get(tool.category) ?? [];
      bucket.push(tool);
      grouped.set(tool.category, bucket);
    }
    return grouped;
  });

  protected readonly grouped = computed(() =>
    this.isFiltering() ? this.filteredGrouped() : new Map(Object.entries(this.registry.groupedByCategory()) as [ToolCategory, ToolDefinition[]][]),
  );

  protected readonly categories = computed(() =>
    this.isFiltering() ? [...this.filteredGrouped().keys()] : TOOL_CATEGORIES,
  );

  protected readonly hasResults = computed(() => !this.isFiltering() || this.filteredGrouped().size > 0);

  protected onQueryInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
