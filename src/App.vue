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
div.search-wrapper
  input(
    type="text"
    placeholder="Search..."
    v-model="searchText"
  )
  button.clear-btn(@click="searchText = ''") ✕
TreeView(
  :nodes="filteredNodes" 
  :showCheckbox="true" 
  selectionMode="multiple" 
  :selectedKeys="selectedKeys"
  :expandedKeys="effectiveExpandedKeys" 
  :searchText="searchText" 
  @toggle-select="onToggleSelect"
  @toggle-expand="onToggleExpand"
)
p Selected IDs:
  ul
    li(v-for="id in selectedKeys" :key="id") {{ id }}
</template>

<style scoped>
.search-wrapper {
  position: relative; 
  margin-bottom: 16px;
  display: flex;
}

.search-wrapper input {
  width: 100%;
  padding: 8px 32px 8px 12px; /* extra right padding for button */
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
}

.search-wrapper input:focus {
  border-color: #4f46e5; /* Indigo */
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  color: #999;
  padding: 0;
  line-height: 1;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  text-align: center;
  box-shadow: 0 0 0 1px #ccc inset;
}

.clear-btn:hover {
  background: #f3f4f6; /* light hover */
  color: #333;
}
</style>
