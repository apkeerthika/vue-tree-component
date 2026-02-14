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

/* filter nodes */
export function filterTree(
  nodes: TreeNode[],
  search: string,
  options: {
    filterBy: string | string[]
    filterMode: 'lenient' | 'strict'
  }
): TreeNode[] {

  console.log('Filter Mode:', options.filterMode)

  const searchLower = search.toLowerCase()
  const fields = Array.isArray(options.filterBy)
    ? options.filterBy
    : [options.filterBy]

  function matches(node: TreeNode): boolean {
    return fields.some(field =>
      String((node as any)[field])
        ?.toLowerCase()
        .includes(searchLower)
    )
  }

  function filterNodes(list: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = []

    for (const node of list) {
      const isMatch = matches(node)

      if (options.filterMode === 'lenient') {
        if (isMatch) {
          result.push({ ...node }) // keep full subtree
        } else if (node.children) {
          const filteredChildren = filterNodes(node.children)
          if (filteredChildren.length) {
            result.push({
              ...node,
              children: filteredChildren
            })
          }
        }
      }

      if (options.filterMode === 'strict') {
        let filteredChildren: TreeNode[] = []

        if (node.children) {
          filteredChildren = filterNodes(node.children)
        }

        if (isMatch || filteredChildren.length) {
          result.push({
            ...node,
            children: filteredChildren
          })
        }
      }
    }

    return result
  }

  return filterNodes(nodes)
}

/* collect expanded ids */
export function collectExpandedIds(nodes: TreeNode[]): string[] {
  const ids: string[] = []
  function walk(list: TreeNode[]) {
    for (const node of list) {
      if(node.children && node.children.length > 0) {
        ids.push(node.id)
        walk(node.children)
      }
    }
  }
  walk(nodes)
  return ids
}

/* highlight search text */
export function highlightText(text: string, searchText: string): string {
  if(!searchText) return text
  const regex = new RegExp(`(${searchText})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}