interface TreeNode {
  key: string;
  id: string;
  title: string;
  children?: any[];
  parentId?: string;
  sortOrder?: string;
}

export function findNodeAndSiblings(
  tree: TreeNode[],
  targetKey: string,
  dropPosition: number,
): { node: TreeNode | null; siblings: TreeNode[] } | null {
  // Helper function to recursively find the node and its siblings
  function findNode(
    nodes: TreeNode[],
  ): { node: TreeNode | null; siblings: TreeNode[] } | null {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Node found
      if (node.id === targetKey) {
        let siblings: TreeNode[] = [];

        if (dropPosition === -1) {
          if (nodes[i - 1]) siblings.push(nodes[i - 1]); // Previous sibling
        } else {
          if (nodes[i + 1]) siblings.push(nodes[i + 1]); // Next sibling
        }
        return { node, siblings };
      }

      // If node has children, recursively search within them
      if (node.children) {
        const result = findNode(node.children);
        if (result) return result;
      }
    }

    return null; // Node not found
  }

  return findNode(tree);
}
