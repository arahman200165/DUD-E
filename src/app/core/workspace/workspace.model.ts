/**
 * Recursive panel tree: a `leaf` hosts one tool (via `ToolHost`), a `split` renders two child
 * nodes side by side through the existing `SplitPane` (`shared/components/split-pane/`), reused
 * unmodified — horizontal only, matching every one of its 27+ existing call sites. Arbitrary depth
 * by construction — "split right" on any leaf just wraps it in a new `split` node. A vertical
 * split would need `SplitPane` itself extended with a direction input; deliberately out of scope
 * here (see `core/workspace/AGENTS.md`).
 */
export type PanelNode =
  | { readonly kind: 'leaf'; readonly nodeId: string; readonly toolId: string }
  | {
      readonly kind: 'split';
      readonly nodeId: string;
      readonly ratio: number;
      readonly a: PanelNode;
      readonly b: PanelNode;
    };

export interface WorkspaceLayout {
  readonly schemaVersion: 1;
  /** Every tool id ever opened this session, in open order — drives the tab strip, independent of
   *  which ones currently have a visible panel leaf (a tab can be "open" but swapped out). */
  readonly openTabs: readonly string[];
  readonly panelTree: PanelNode | null;
  readonly focusedNodeId: string | null;
}

export const EMPTY_WORKSPACE_LAYOUT: WorkspaceLayout = {
  schemaVersion: 1,
  openTabs: [],
  panelTree: null,
  focusedNodeId: null,
};

/** Defensive parse: unknown/corrupt persisted data resets to an empty layout rather than throwing. */
export function migrateWorkspaceLayout(raw: unknown): WorkspaceLayout {
  if (!raw || typeof raw !== 'object') return EMPTY_WORKSPACE_LAYOUT;
  const candidate = raw as Partial<WorkspaceLayout>;
  if (candidate.schemaVersion === 1 && Array.isArray(candidate.openTabs)) {
    return {
      schemaVersion: 1,
      openTabs: candidate.openTabs,
      panelTree: candidate.panelTree ?? null,
      focusedNodeId: candidate.focusedNodeId ?? null,
    };
  }
  return EMPTY_WORKSPACE_LAYOUT;
}

type LeafNode = Extract<PanelNode, { kind: 'leaf' }>;

export function findLeafByToolId(node: PanelNode | null, toolId: string): LeafNode | null {
  if (!node) return null;
  if (node.kind === 'leaf') return node.toolId === toolId ? node : null;
  return findLeafByToolId(node.a, toolId) ?? findLeafByToolId(node.b, toolId);
}

export function findNodeById(node: PanelNode | null, nodeId: string): PanelNode | null {
  if (!node) return null;
  if (node.nodeId === nodeId) return node;
  if (node.kind === 'leaf') return null;
  return findNodeById(node.a, nodeId) ?? findNodeById(node.b, nodeId);
}

export function findFirstLeaf(node: PanelNode | null): LeafNode | null {
  if (!node) return null;
  if (node.kind === 'leaf') return node;
  return findFirstLeaf(node.a) ?? findFirstLeaf(node.b);
}

/** Replaces the node with id `nodeId` with `replacement`, wherever it sits in the tree. */
export function replaceNode(node: PanelNode, nodeId: string, replacement: PanelNode): PanelNode {
  if (node.nodeId === nodeId) return replacement;
  if (node.kind === 'leaf') return node;
  return { ...node, a: replaceNode(node.a, nodeId, replacement), b: replaceNode(node.b, nodeId, replacement) };
}

/**
 * Removes the leaf with id `nodeId`. If it's a direct child of a split, the sibling subtree takes
 * the split's place. Returns `null` only when the whole tree was that one leaf.
 */
export function removeLeafById(node: PanelNode | null, nodeId: string): PanelNode | null {
  if (!node) return null;
  if (node.kind === 'leaf') return node.nodeId === nodeId ? null : node;

  if (node.a.kind === 'leaf' && node.a.nodeId === nodeId) return node.b;
  if (node.b.kind === 'leaf' && node.b.nodeId === nodeId) return node.a;

  return { ...node, a: removeLeafById(node.a, nodeId) ?? node.a, b: removeLeafById(node.b, nodeId) ?? node.b };
}
