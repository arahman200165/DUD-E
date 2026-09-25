import { describe, expect, it } from 'vitest';
import {
  EMPTY_WORKSPACE_LAYOUT,
  PanelNode,
  findFirstLeaf,
  findLeafByToolId,
  findNodeById,
  migrateWorkspaceLayout,
  removeLeafById,
  replaceNode,
} from './workspace.model';

const leaf = (nodeId: string, toolId: string): PanelNode => ({ kind: 'leaf', nodeId, toolId });
const split = (nodeId: string, a: PanelNode, b: PanelNode): PanelNode => ({
  kind: 'split',
  nodeId,
  ratio: 0.5,
  a,
  b,
});

describe('migrateWorkspaceLayout', () => {
  it('resets to empty for corrupt/unrecognized data', () => {
    expect(migrateWorkspaceLayout(null)).toEqual(EMPTY_WORKSPACE_LAYOUT);
    expect(migrateWorkspaceLayout({ schemaVersion: 2 })).toEqual(EMPTY_WORKSPACE_LAYOUT);
    expect(migrateWorkspaceLayout('garbage')).toEqual(EMPTY_WORKSPACE_LAYOUT);
  });

  it('passes through a valid layout', () => {
    const layout = { schemaVersion: 1 as const, openTabs: ['base64'], panelTree: leaf('n1', 'base64'), focusedNodeId: 'n1' };
    expect(migrateWorkspaceLayout(layout)).toEqual(layout);
  });
});

describe('tree helpers', () => {
  const tree = split('root', leaf('a', 'base64'), leaf('b', 'json'));

  it('findLeafByToolId finds a leaf anywhere in the tree', () => {
    expect(findLeafByToolId(tree, 'json')).toEqual(leaf('b', 'json'));
    expect(findLeafByToolId(tree, 'missing')).toBeNull();
    expect(findLeafByToolId(null, 'anything')).toBeNull();
  });

  it('findNodeById finds a split or a leaf by id', () => {
    expect(findNodeById(tree, 'root')).toEqual(tree);
    expect(findNodeById(tree, 'a')).toEqual(leaf('a', 'base64'));
    expect(findNodeById(tree, 'missing')).toBeNull();
  });

  it('findFirstLeaf walks to the leftmost leaf', () => {
    expect(findFirstLeaf(tree)).toEqual(leaf('a', 'base64'));
    expect(findFirstLeaf(null)).toBeNull();
  });

  it('replaceNode swaps a leaf in place', () => {
    const updated = replaceNode(tree, 'a', leaf('a', 'hash'));
    expect(findLeafByToolId(updated, 'hash')).toEqual(leaf('a', 'hash'));
    expect(findLeafByToolId(updated, 'base64')).toBeNull();
  });

  it('removeLeafById collapses a split into its sibling when a direct child leaf is removed', () => {
    expect(removeLeafById(tree, 'a')).toEqual(leaf('b', 'json'));
    expect(removeLeafById(tree, 'b')).toEqual(leaf('a', 'base64'));
  });

  it('removeLeafById returns null when the whole tree is the removed leaf', () => {
    expect(removeLeafById(leaf('only', 'base64'), 'only')).toBeNull();
  });

  it('removeLeafById recurses into nested splits without collapsing the wrong level', () => {
    const nested = split('root', split('inner', leaf('a', 'base64'), leaf('b', 'json')), leaf('c', 'hash'));
    const updated = removeLeafById(nested, 'a');
    expect(updated).toEqual(split('root', leaf('b', 'json'), leaf('c', 'hash')));
  });
});
