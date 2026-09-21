import { Component, computed, inject } from '@angular/core';
import { UpdateService } from '../../../core/connectivity/update.service';
import { DesktopUpdateService } from '../../../core/platform/desktop-update.service';
import { PlatformService } from '../../../core/platform/platform.service';

/**
 * Branches between the web `UpdateService` (SwUpdate) and the desktop
 * `DesktopUpdateService` (electron-updater) internally, so `shell-layout`
 * can keep rendering a bare `<app-update-badge />` regardless of platform.
 */
@Component({
  selector: 'app-update-badge',
  templateUrl: './update-badge.html',
})
export class UpdateBadge {
  private readonly platform = inject(PlatformService);
  private readonly webUpdate = inject(UpdateService);
  private readonly desktopUpdate = inject(DesktopUpdateService);

  protected readonly updateReady = computed(() => (this.platform.isDesktop() ? this.desktopUpdate.updateReady() : this.webUpdate.updateReady()));
  protected readonly actionLabel = computed(() => (this.platform.isDesktop() ? 'Restart & Install' : 'Reload'));

  protected activate(): void {
    if (this.platform.isDesktop()) void this.desktopUpdate.restartAndInstall();
    else void this.webUpdate.activateUpdate();
  }
}
