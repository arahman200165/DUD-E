import { Component, computed, inject, input } from '@angular/core';
import { ConnectivityService } from '../../../core/connectivity/connectivity.service';
import { OfflineBadge } from '../offline-badge/offline-badge';

@Component({
  selector: 'app-tool-shell',
  imports: [OfflineBadge],
  templateUrl: './tool-shell.html',
})
export class ToolShell {
  private readonly connectivity = inject(ConnectivityService);

  readonly title = input.required<string>();
  readonly status = input<'stable' | 'experimental'>('experimental');
  readonly networkRequired = input(false);

  protected readonly showOfflineBadge = computed(() => this.networkRequired() && !this.connectivity.online());
}
