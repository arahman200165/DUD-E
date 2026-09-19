import { Injectable, isDevMode } from '@angular/core';
import { ToolCategory, TOOL_CATEGORIES } from '../../shared/models/tool-category.model';
import { ToolDefinition } from '../../shared/models/tool-definition.model';
import { TOOL_DEFINITIONS } from './tool-definitions';
import { searchTools } from './tool-search';
import { toRoutePath } from './tool-routes';

export function validateDefinitions(definitions: readonly ToolDefinition[]): void {
  const seenIds = new Set<string>();
  const seenRoutes = new Set<string>();

  for (const definition of definitions) {
    if (seenIds.has(definition.id)) {
      console.error(`Duplicate tool id "${definition.id}" found in TOOL_DEFINITIONS`);
    }
    seenIds.add(definition.id);

    const routePath = toRoutePath(definition.route);
    if (seenRoutes.has(routePath)) {
      console.error(`Duplicate tool route "${definition.route}" found in TOOL_DEFINITIONS`);
    }
    seenRoutes.add(routePath);
  }
}

@Injectable({ providedIn: 'root' })
export class ToolRegistryService {
  private readonly definitions: readonly ToolDefinition[] = TOOL_DEFINITIONS;

  constructor() {
    if (isDevMode()) {
      validateDefinitions(this.definitions);
    }
  }

  getAll(): readonly ToolDefinition[] {
    return this.definitions;
  }

  getById(id: string): ToolDefinition | undefined {
    return this.definitions.find((definition) => definition.id === id);
  }

  getByRoute(route: string): ToolDefinition | undefined {
    const routePath = toRoutePath(route);
    return this.definitions.find((definition) => toRoutePath(definition.route) === routePath);
  }

  getByCategory(category: ToolCategory): ToolDefinition[] {
    return this.definitions.filter((definition) => definition.category === category);
  }

  groupedByCategory(): Record<ToolCategory, ToolDefinition[]> {
    const grouped = Object.fromEntries(
      TOOL_CATEGORIES.map((category) => [category, [] as ToolDefinition[]]),
    ) as Record<ToolCategory, ToolDefinition[]>;

    for (const definition of this.definitions) {
      grouped[definition.category].push(definition);
    }

    return grouped;
  }

  search(query: string): ToolDefinition[] {
    return searchTools(this.definitions, query);
  }
}
