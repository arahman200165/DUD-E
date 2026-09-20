import { Component, forwardRef, input, signal } from '@angular/core';

/**
 * Generic node shape for `TreeView` — deliberately not JSON-specific so a
 * future tool (e.g. an XML structure view) can reuse this primitive. A
 * domain-specific tool is responsible for turning its own parsed data into
 * this shape (see `json-tree.ts`'s `toTreeNode`).
 */
export interface TreeNode {
  readonly label: string;
  readonly path: string;
  readonly valueLabel: string;
  readonly type: string;
  readonly children?: readonly TreeNode[];
}

/**
 * Reusable recursive collapsible tree renderer (PRD Section 4.3: dense over
 * decorative — no per-type color invention, just the shared palette).
 * Presentational only; a consuming tool owns node construction and labeling.
 */
@Component({
  selector: 'app-tree-view',
  imports: [forwardRef(() => TreeView)],
  templateUrl: './tree-view.html',
})
export class TreeView {
  readonly nodes = input.required<readonly TreeNode[]>();

  private readonly collapsedSignal = signal<ReadonlySet<string>>(new Set());

  protected isExpanded(node: TreeNode): boolean {
    return !!node.children && !this.collapsedSignal().has(node.path);
  }

  protected toggle(node: TreeNode): void {
    const next = new Set(this.collapsedSignal());
    if (next.has(node.path)) next.delete(node.path);
    else next.add(node.path);
    this.collapsedSignal.set(next);
  }
}
