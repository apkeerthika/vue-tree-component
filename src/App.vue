<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import TreeView from './components/TreeView.vue';
import type { TreeNode } from './types/TreeNode';

const sampleData: TreeNode[] = [
    {
        id: '1',
        label: 'Electronics',
        children: [
            {
                id: '1-1',
                label: 'Phones',
                children: [
                    { id: '1-1-1', label: 'iPhone' },
                    { id: '1-1-2', label: 'Samsung' }
                ]
            },
            { id: '1-2', label: 'Laptops' }
        ]
    },
    {
        id: '2',
        label: 'Books'
    }
];

function enrichNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.map(node => ({
    ...node,
    _originalChildren: node.children ? enrichNodes(node.children) : [],
    children: node.children ? enrichNodes(node.children) : [],
  }))
}

const enrichedSampleData = enrichNodes(sampleData)

const searchText = ref('')
const selectedKeys = ref<string[]>([])
const manualExpandedKeys = ref<Set<string>>(new Set())
const searchExpandedKeys = ref<Set<string>>(new Set())


function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  if (!query) {
    return nodes.map(node => ({
      ...node,
      _originalChildren: node._originalChildren || node.children || []
    }))
  }

  return nodes
    .map(node => {
      const matches = node.label.toLowerCase().includes(query.toLowerCase())
      let filteredChildren: TreeNode[] = []

      if (node.children) {
        filteredChildren = filterTree(node.children, query)
      }

      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
          _originalChildren: node._originalChildren || node.children || []
        }
      }
      return null
    })
    .filter(Boolean) as TreeNode[]
}


const filteredNodes = computed(() => filterTree(enrichedSampleData, searchText.value))


function collectExpandedIds(nodes: TreeNode[], query: string, expanded: Set<string>): boolean {
  let hasMatch = false

  for (const node of nodes) {
    const matches = node.label.toLowerCase().includes(query.toLowerCase())
    let childHasMatch = false

    if (node.children) {
      childHasMatch = collectExpandedIds(node.children, query, expanded)
    }

    if ((matches || childHasMatch) && node._originalChildren && node._originalChildren.length > 0) {
  expanded.add(node.id)
}

    hasMatch = hasMatch || matches || childHasMatch
  }

  return hasMatch
}

watch(searchText, (value) => {
  searchExpandedKeys.value.clear()
  if (!value) return
  collectExpandedIds(enrichedSampleData, value, searchExpandedKeys.value)
})

const effectiveExpandedKeys = computed(() =>
  searchText.value ? searchExpandedKeys.value : manualExpandedKeys.value
)

function onToggleSelect(id: string) {
  const index = selectedKeys.value.indexOf(id)
  if (index > -1) selectedKeys.value.splice(index, 1)
  else selectedKeys.value.push(id)
}

function onToggleExpand(id: string) {
  manualExpandedKeys.value.has(id)
    ? manualExpandedKeys.value.delete(id)
    : manualExpandedKeys.value.add(id)
}


</script>

<template lang="pug">
  input(
    type="text"
    placeholder="Search..."
    v-model="searchText"
  )
  TreeView(
    :nodes="filteredNodes" 
    :showCheckbox="true" 
    selectionMode="multiple" 
    :selectedKeys="selectedKeys"
    :expandedKeys="effectiveExpandedKeys"  
    @toggle-select="onToggleSelect"
    @toggle-expand="onToggleExpand"
  )
  p Selected IDs:
    ul
      li(v-for="id in selectedKeys" :key="id") {{ id }}
</template>

<style scoped>

</style>
