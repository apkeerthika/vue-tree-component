import { ref, computed } from 'vue'
import { filterTree, findPath } from '@/components/treeHelpers'
import type { TreeNode } from '@/types/TreeNode'

export function useTreeFilter(props: any) {
  const searchText = ref('')

  const filteredNodes = computed<TreeNode[]>(() => {
    if (!props.filter || !searchText.value.trim()) {
      return props.nodes
    }

    return filterTree(props.nodes, searchText.value, {
      filterBy: props.filterBy ?? 'label',
      filterMode: props.filterMode ?? 'lenient'
    })
  })

  const computedExpandedKeys = computed<string[]>(() => {
    if (!searchText.value.trim()) {
      return props.expandedKeys
    }

    const expanded = new Set<string>()

    function collect(nodes: TreeNode[]) {
      for (const node of nodes) {
        const path = findPath(props.nodes, node.id)
        path.slice(0, -1).forEach(p => expanded.add(p.id))

        if (node.children?.length) {
          collect(node.children)
        }
      }
    }

    collect(filteredNodes.value)
    return Array.from(expanded)
  })

  const showNoResults = computed(() =>
    props.filter &&
    searchText.value.trim() &&
    filteredNodes.value.length === 0
  )

  const resultCount = computed(() => {
    if (!searchText.value.trim()) return 0
    return filteredNodes.value.length
  })

  function clearSearch() {
    searchText.value = ''
  }

  return {
    searchText,
    filteredNodes,
    computedExpandedKeys,
    showNoResults,
    resultCount,
    clearSearch
  }
}
