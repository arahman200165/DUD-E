import { Component, inject } from '@angular/core';
import { UpdateService } from '../../../core/connectivity/update.service';

@Component({
  selector: 'app-update-badge',
  templateUrl: './update-badge.html',
})
export class UpdateBadge {
  protected readonly updateService = inject(UpdateService);
}
