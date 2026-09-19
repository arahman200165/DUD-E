import { Component, input } from '@angular/core';

export type BusyIndicatorStatus = 'idle' | 'running' | 'done' | 'error' | 'cancelled';

@Component({
  selector: 'app-busy-indicator',
  templateUrl: './busy-indicator.html',
})
export class BusyIndicator {
  readonly status = input.required<BusyIndicatorStatus>();
  readonly progress = input<number | null>(null);
}
