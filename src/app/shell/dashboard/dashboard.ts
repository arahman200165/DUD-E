import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORY_METADATA, TOOL_CATEGORIES } from '../../shared/models/tool-category.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly categories = TOOL_CATEGORIES;
  protected readonly meta = CATEGORY_METADATA;
}
