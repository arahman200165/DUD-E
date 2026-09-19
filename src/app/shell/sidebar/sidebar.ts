import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CATEGORY_METADATA, TOOL_CATEGORIES } from '../../shared/models/tool-category.model';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  protected readonly categories = TOOL_CATEGORIES;
  protected readonly meta = CATEGORY_METADATA;
}
