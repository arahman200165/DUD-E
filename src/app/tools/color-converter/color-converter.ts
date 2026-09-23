import { Component, computed, inject } from '@angular/core';
import { ToolShell } from '../../shared/components/tool-shell/tool-shell';
import { ErrorPanel } from '../../shared/components/error-panel/error-panel';
import { PersistenceService } from '../../core/persistence/persistence.service';
import { parseColor } from './color-convert';

@Component({
  selector: 'app-color-converter',
  imports: [ToolShell, ErrorPanel],
  templateUrl: './color-converter.html',
})
export class ColorConverter {
  private readonly persistence = inject(PersistenceService);

  protected readonly input = this.persistence.signal('color-converter', 'input', 'session', '#3b82f6');

  protected readonly result = computed(() => parseColor(this.input()));

  protected readonly rows = computed(() => {
    const current = this.result();
    if (!current.ok) return [];

    const { hex, rgb, hsl, hsv, cmyk, lab, lch, hwb, oklab, oklch, name } = current.formats;
    return [
      { label: 'HEX', value: hex },
      { label: 'RGB', value: rgb },
      { label: 'HSL', value: hsl },
      { label: 'HSV', value: hsv },
      { label: 'CMYK', value: cmyk },
      { label: 'LAB', value: lab },
      { label: 'LCH', value: lch },
      { label: 'HWB', value: hwb },
      { label: 'OKLAB', value: oklab },
      { label: 'OKLCH', value: oklch },
      { label: 'Closest name', value: name ?? '—' },
    ];
  });

  protected onInputChange(event: Event): void {
    this.input.set((event.target as HTMLInputElement).value);
  }

  protected copy(value: string): void {
    void navigator.clipboard.writeText(value);
  }
}
