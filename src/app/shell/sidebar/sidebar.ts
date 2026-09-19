import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CATEGORY_METADATA, TOOL_CATEGORIES } from '../../shared/models/tool-category.model';
import { ToolRegistryService } from '../../core/registry/tool-registry.service';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { CommandPaletteService } from '../command-palette/command-palette.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly registry = inject(ToolRegistryService);
  private readonly persistence = inject(PersistenceService);
  protected readonly paletteService = inject(CommandPaletteService);

  protected readonly categories = TOOL_CATEGORIES;
  protected readonly meta = CATEGORY_METADATA;
  protected readonly grouped = this.registry.groupedByCategory();

  protected onClearAll(): void {
    if (confirm('Clear all saved DUD-E data from this browser? This cannot be undone.')) {
      this.persistence.clearAll();
    }
  }
}
