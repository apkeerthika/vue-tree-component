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
export function filterTree(nodes: TreeNode[], searchText: string, options?: { filterBy?: string | string[], filterMode?: 'lenient' | 'strict' }): TreeNode[] {
  if(!searchText) return nodes

  const { filterBy = 'label', filterMode = 'lenient' } = options || {}
  const fields = Array.isArray(filterBy) ? filterBy : [filterBy]
  const query = searchText.toLowerCase()

  function recursiveFilter(node: TreeNode): TreeNode | null {
    const nodeMatches = fields.some(field => {
      const value = (node as any)[field]
      return value?.toString().toLowerCase().includes(query)
    })

    const children: TreeNode[] = []
    if (node.children?.length) {
      for (const child of node.children) {
        const filteredChild = recursiveFilter(child)
        if (filteredChild) {
          children.push(filteredChild)
        }
      }
    }

    if (filterMode === 'lenient' && nodeMatches) {
      return { ...node, children: node.children || [] }
    }

    if (nodeMatches || children.length > 0) {
      return { ...node, children }
    }

    return null
  }
  return nodes.map(n => recursiveFilter(n)).filter(Boolean) as TreeNode[]
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