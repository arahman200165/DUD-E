import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectivityService } from '../../../core/connectivity/connectivity.service';
import { ToolRegistryService } from '../../../core/registry/tool-registry.service';
import { CATEGORY_METADATA } from '../../models/tool-category.model';
import { OfflineBadge } from '../offline-badge/offline-badge';
import { CategoryIcon } from '../category-icon/category-icon';

@Component({
  selector: 'app-tool-shell',
  imports: [OfflineBadge, CategoryIcon],
  templateUrl: './tool-shell.html',
})
export class ToolShell {
  private readonly connectivity = inject(ConnectivityService);
  private readonly router = inject(Router);
  private readonly registry = inject(ToolRegistryService);

  readonly title = input.required<string>();
  readonly status = input<'stable' | 'experimental'>('experimental');
  readonly networkRequired = input(false);

  protected readonly showOfflineBadge = computed(() => this.networkRequired() && !this.connectivity.online());

  protected readonly category = computed(() => this.registry.getByRoute(this.router.url)?.category);
  protected readonly categoryMeta = computed(() => {
    const category = this.category();
    return category ? CATEGORY_METADATA[category] : undefined;
  });
}
