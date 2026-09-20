import { Component, input } from '@angular/core';

/**
 * Reusable dense table renderer (PRD Section 4.3: dense over decorative).
 * Presentational only — no sorting/filtering/virtualization; a tool wanting
 * those builds them on top rather than growing this primitive speculatively.
 */
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.html',
})
export class DataTable {
  readonly columns = input.required<readonly string[]>();
  readonly rows = input.required<readonly (readonly string[])[]>();
}
