import type { TreeNode } from "@/types/TreeNode";


export function isExpanded(
    id: string,
    expandedKeys: string[]
): boolean {
    return expandedKeys.includes(id)
}

export function isChecked(
    id: string,
    selectedKeys: string[]
): boolean {
    return selectedKeys.includes(id)
}
export function hasChildren(node?: TreeNode): boolean {
  return Array.isArray(node?.children) && node.children.length > 0
}

export function collectDescendantIds(node: TreeNode): string[] {
  if (!node.children) return []

  return node.children.flatMap(child => {
    if (child.skipInheritance) return []
    return [
      child.id,
      ...collectDescendantIds(child)
    ]
  })
}

/* check if node is indeterminate */
export function isIndeterminate(node: TreeNode, selectedKeys: string[]): boolean {
  if (!node.children || node.skipInheritance) return false
  const childIds = collectDescendantIds(node)
  const selectedCount = childIds.filter(id => selectedKeys.includes(id)).length
  return selectedCount > 0 && selectedCount < childIds.length
}

/* check if node is fully checked */
export function isFullyChecked(node: TreeNode, selectedKeys: string[]): boolean {
  if (!node.children || node.skipInheritance) {
    return selectedKeys.includes(node.id)
  }
  const childIds = collectDescendantIds(node)
  return childIds.every(id => selectedKeys.includes(id))
}

export  function findNodeById(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const foundNode = findNodeById(node.children, id)
      if (foundNode) return foundNode
    }
  }
  return null
}

/* check if node is partially checked */
export function isPartiallyChecked(node: TreeNode, selectedKeys: string[]): boolean {
  if (!node.children || node.children.length === 0) return false
  const descendantIds = collectDescendantIds(node)
  if (descendantIds.length === 0) return false
  const checkedCount = descendantIds.filter(id => selectedKeys.includes(id)).length
  return checkedCount > 0 && checkedCount < descendantIds.length
}
