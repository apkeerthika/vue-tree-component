import type { TreeNode } from "@/types/TreeNode";

export function isChecked(
        id: string,
        selectedKeys: string[]
    ): boolean {
        return selectedKeys?.includes(id) ?? false
    }

export function isExpanded(
        id: string,
        expandedKeys: string[]
    ): boolean {
        return expandedKeys?.includes(id) ?? false 
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
  if (!node.children || node.children.length === 0 || node.skipInheritance) {
    return false
  }

  const descendantIds = collectDescendantIds(node)
  if (descendantIds.length === 0) return false

  const checkedCount = descendantIds.filter(id =>
    selectedKeys.includes(id)
  ).length

  return checkedCount > 0 && checkedCount < descendantIds.length
}


/* check if node is fully checked */
export function isFullyChecked(node: TreeNode, selectedKeys: string[]): boolean {

  console.log(node.id, selectedKeys)
  if (!node.children || node.skipInheritance) {
    return selectedKeys?.includes(node.id) ?? false
  }
  const childIds = collectDescendantIds(node)
  return childIds.every(id => selectedKeys?.includes(id)) ?? false
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

/* highlight search text */
export function highlightText(text: string, searchText?: string): string {
  if(!searchText) return text
  const regex = new RegExp(`(${searchText})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

export function findPath(nodes: TreeNode[], id: string, path: TreeNode[] = []): TreeNode[] {
  for (const node of nodes) {
    const newPath = [...path, node]
    if (node.id === id) return newPath
    if (node.children) {
      const foundPath = findPath(node.children, id, newPath)
      if (foundPath.length) return foundPath
    }
  }
  return []
}

export function isNodeSelected(node: TreeNode, selectedKeys: string[]): boolean {
  console.log(node.id, selectedKeys)
  return selectedKeys.includes(node.id)
}