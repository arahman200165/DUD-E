import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CATEGORY_METADATA, TOOL_CATEGORIES } from '../../shared/models/tool-category.model';
import { ToolRegistryService } from '../../core/registry/tool-registry.service';
import { WorkspaceLayoutService } from '../../core/workspace/workspace-layout.service';
import { ClearAllDataService } from '../../core/workspace/clear-all-data';
import { CommandPaletteService } from '../command-palette/command-palette.service';
import { CategoryIcon } from '../../shared/components/category-icon/category-icon';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CategoryIcon],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly registry = inject(ToolRegistryService);
  private readonly clearAllData = inject(ClearAllDataService);
  private readonly workspaceLayout = inject(WorkspaceLayoutService);
  protected readonly paletteService = inject(CommandPaletteService);

  protected readonly categories = TOOL_CATEGORIES;
  protected readonly meta = CATEGORY_METADATA;
  protected readonly grouped = this.registry.groupedByCategory();
  protected readonly openTabCount = computed(() => this.workspaceLayout.openTabs().length);

  protected async onClearAll(): Promise<void> {
    if (confirm('Clear all saved DUDE data from this browser? This cannot be undone.')) {
      await this.clearAllData.clearAll();
    }
  }
}
