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
