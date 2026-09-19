import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { CommandPaletteService } from '../command-palette/command-palette.service';

@Component({
  selector: 'app-shell-layout',
  imports: [RouterOutlet, Sidebar],
  templateUrl: './shell-layout.html',
})
export class ShellLayout {
  private readonly paletteService = inject(CommandPaletteService);

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.paletteService.toggle();
    }
  }
}
