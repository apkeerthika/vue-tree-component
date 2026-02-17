import { ref, computed, type Ref } from 'vue'
import type { TreeNode } from '@/types/TreeNode'
import { findPath, collectDescendantIds } from '@/components/helpers/treeHelpers'

export function useTreeSelection(
  nodes: Ref<TreeNode[]>
) {
  const selectionMode = ref<'single' | 'multiple'>('multiple')
  const inheritRules = ref(true)
  const selectedKeys = ref<string[]>([])

  const nodeMap = computed(() => {
    const map = new Map<string, TreeNode>()

    function traverse(list: TreeNode[]) {
      for (const node of list) {
        map.set(node.id, node)
        if (node.children?.length) {
          traverse(node.children)
        }
      }
    }

    traverse(nodes.value)
    return map
  })

  const tempSelectedNodes = computed(() =>
    selectedKeys.value
      .map(id => nodeMap.value.get(id))
      .filter((n): n is TreeNode => !!n)
  )

  const tempSelectedNode = computed(() => {
    if (
      selectionMode.value !== 'single' ||
      !selectedKeys.value.length
    ) {
      return null
    }

  const id = selectedKeys.value[0]
  return nodeMap.value.get(id) ?? null
})

  function toggleSelect(node: TreeNode | undefined, checked: boolean = true) {
    if (!node) return
    const id = node.id

    if (selectionMode.value === 'single') {
      selectedKeys.value = [id]
      return
    }

    const newSelected = new Set(selectedKeys.value)

    const shouldCascade =
      inheritRules.value && !node.skipInheritance
    if (!shouldCascade) {
      if (checked) {
        newSelected.add(id)
      } else {
        newSelected.delete(id)
      }

      selectedKeys.value = Array.from(newSelected)
      return
    }

    const descendantIds = collectDescendantIds(node)

    if (checked) {
      newSelected.add(id)
      descendantIds.forEach(d => newSelected.add(d))
    } else {
      newSelected.delete(id)
      descendantIds.forEach(d => newSelected.delete(d))
    }

    const path = findPath(nodes.value, id) ?? []

    path.slice(0, -1).reverse().forEach(parent => {
      if (parent.skipInheritance) return

      const childIds = collectDescendantIds(parent)
      const allSelected = childIds.every(c =>
        newSelected.has(c)
      )

      if (allSelected) {
        newSelected.add(parent.id)
      } else {
        newSelected.delete(parent.id)
      }
    })

    selectedKeys.value = Array.from(newSelected)
  }

  return {
    selectionMode,
    inheritRules,
    selectedKeys,
    tempSelectedNode,
    tempSelectedNodes,
    toggleSelect
  }
}
