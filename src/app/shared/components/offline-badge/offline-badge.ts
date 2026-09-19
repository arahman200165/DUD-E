import { Component, input } from '@angular/core';

@Component({
  selector: 'app-offline-badge',
  templateUrl: './offline-badge.html',
})
export class OfflineBadge {
  readonly show = input(true);
}
