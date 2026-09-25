import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectivityService } from '../../../core/connectivity/connectivity.service';
import { ToolRegistryService } from '../../../core/registry/tool-registry.service';
import { WORKSPACE_HOST_CONTEXT } from '../../../core/workspace/workspace-host-context';
import { CATEGORY_METADATA } from '../../models/tool-category.model';
import { OfflineBadge } from '../offline-badge/offline-badge';
import { CategoryIcon } from '../category-icon/category-icon';
import { SecurityBadge } from '../security-badge/security-badge';

@Component({
  selector: 'app-tool-shell',
  imports: [OfflineBadge, CategoryIcon, SecurityBadge],
  templateUrl: './tool-shell.html',
})
export class ToolShell {
  private readonly connectivity = inject(ConnectivityService);
  private readonly router = inject(Router);
  private readonly registry = inject(ToolRegistryService);
  private readonly hostContext = inject(WORKSPACE_HOST_CONTEXT);

  readonly title = input.required<string>();
  readonly status = input<'stable' | 'experimental'>('experimental');
  readonly networkRequired = input(false);

  protected readonly showOfflineBadge = computed(() => this.networkRequired() && !this.connectivity.online());

  /**
   * Outside Workspace (a tool's own direct route), `hostContext` is `null` (the token's default)
   * and this falls back to the existing route-derived lookup, unchanged. Inside Workspace,
   * `ToolHost` provides an explicit `toolId` via DI, since two tools can be mounted at once and
   * `router.url` can only ever point at one of them — see `core/workspace/workspace-host-context.ts`.
   */
  protected readonly definition = computed(() => {
    const hostContext = this.hostContext;
    return hostContext ? this.registry.getById(hostContext.toolId) : this.registry.getByRoute(this.router.url);
  });
  protected readonly category = computed(() => this.definition()?.category);
  protected readonly categoryMeta = computed(() => {
    const category = this.category();
    return category ? CATEGORY_METADATA[category] : undefined;
  });
}
