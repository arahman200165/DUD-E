import { Route, Routes } from '@angular/router';
import { ToolDefinition } from '../../shared/models/tool-definition.model';
import { TOOL_DEFINITIONS } from './tool-definitions';

export function toRoutePath(route: string): string {
  return route.startsWith('/') ? route.slice(1) : route;
}

export function buildToolRoutes(definitions: readonly ToolDefinition[] = TOOL_DEFINITIONS): Routes {
  return definitions.map((definition) => ({
    path: toRoutePath(definition.route),
    loadComponent: definition.load as Route['loadComponent'],
  }));
}
