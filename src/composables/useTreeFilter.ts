import { ref, computed } from 'vue'
import { findPath } from '@/components/helpers/treeHelpers'
import type { TreeNode } from '@/types/TreeNode'

export function useTreeFilter(props: {
  nodes: TreeNode[]
  filter: boolean
  filterBy: string | string[]
  filterMode: 'lenient' | 'strict'
  expandedKeys: string[]
}) {
  const searchText = ref('')

  function filterTree(
      nodes: TreeNode[],
      search: string,
      options: {
        filterBy: string | string[]
        filterMode: 'lenient' | 'strict'
      }
    ): TreeNode[] {

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
              children: node.children
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
