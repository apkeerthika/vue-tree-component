import { ref, type Ref } from 'vue'
import type { TreeNode } from '@/types/TreeNode'
import { collectDescendantIds, findNodeById, findPath } from '@/components/treeHelpers'

export function useTreeSelection(nodes: Ref<TreeNode[]>) {
  const selectionMode = ref<'single' | 'multiple'>('single')
  const selectedKeys = ref<string[]>([])
  const tempSelectedNode = ref<TreeNode | null>(null)
  const tempSelectedNodes = ref<TreeNode[]>([])

  function isFullyChecked(node: TreeNode): boolean {
    if (!node.children?.length) {
      return selectedKeys.value.includes(node.id)
    }

    const ids = collectDescendantIds(node)
    return ids.every(id => selectedKeys.value.includes(id))
  }

  function isPartiallyChecked(node: TreeNode): boolean {
    if (!node.children?.length) return false

    const ids = collectDescendantIds(node)
    const selectedChildren = ids.filter(id => selectedKeys.value.includes(id))

    return selectedChildren.length > 0 && selectedChildren.length < ids.length
  }

  function toggleSelect(node: TreeNode, checked: boolean) {
    const id = node.id

    if (selectionMode.value === 'single') {
      selectedKeys.value = [id]
      tempSelectedNode.value = node
      tempSelectedNodes.value = []
      return
    }

    // MULTIPLE MODE
    const descendantIds = collectDescendantIds(node)
    const path = findPath(nodes.value, id)
    const newSelected = new Set(selectedKeys.value)

    if (checked) {
      newSelected.add(id)
      descendantIds.forEach(d => newSelected.add(d))
    } else {
      newSelected.delete(id)
      descendantIds.forEach(d => newSelected.delete(d))
    }

    // update parents (ONLY fully selected parents)
    path.slice(0, -1).reverse().forEach(parent => {
      const childIds = collectDescendantIds(parent)
      const allSelected = childIds.every(c => newSelected.has(c))

      if (allSelected) {
        newSelected.add(parent.id)
      } else {
        newSelected.delete(parent.id)
      }
    })

    selectedKeys.value = Array.from(newSelected)
    tempSelectedNodes.value = selectedKeys.value
        .map(id => findNodeById(nodes.value, id))
        .filter((n): n is TreeNode => !!n)
  }

  return {
    selectionMode,
    selectedKeys,
    tempSelectedNode,
    tempSelectedNodes,
    isFullyChecked,
    isPartiallyChecked,
    toggleSelect
  }
}
