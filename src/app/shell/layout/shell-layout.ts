import { Component, HostListener, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { CommandPaletteService } from '../command-palette/command-palette.service';
import { ConnectivityService } from '../../core/connectivity/connectivity.service';
import { OfflineBadge } from '../../shared/components/offline-badge/offline-badge';
import { UpdateBadge } from '../../shared/components/update-badge/update-badge';

@Component({
  selector: 'app-shell-layout',
  imports: [RouterOutlet, Sidebar, OfflineBadge, UpdateBadge],
  templateUrl: './shell-layout.html',
})
export class ShellLayout {
  private readonly paletteService = inject(CommandPaletteService);
  private readonly connectivity = inject(ConnectivityService);

  protected readonly offline = computed(() => !this.connectivity.online());

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.paletteService.toggle();
    }
  }
}
