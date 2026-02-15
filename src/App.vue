<script setup lang="ts">
import { ref, computed } from 'vue'
import TreeView from './components/TreeView.vue'
import type { TreeNode } from './types/TreeNode'
import { treeData } from './data/treeData'
import { collectDescendantIds, findNodeById, filterTree, collectExpandedIds, findPath } from './components/treeHelpers'

const nodes = ref<TreeNode[]>(treeData)

const selectionMode = ref<'single' | 'multiple'>('single')
const expandOnClick = ref(false)
const tempSelectedNode = ref<TreeNode | null>(null)


const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])

function toggleExpand(id: string) {
  const i = expandedKeys.value.indexOf(id)
  if (i > -1) {
    expandedKeys.value.splice(i, 1)
  } else {
    expandedKeys.value.push(id)
  }
}

function handleToggleSelect(id: string, checked: boolean) {
  if (selectionMode.value === 'single') {
    selectedKeys.value = [id]

    const node = findNodeById(nodes.value, id)
    tempSelectedNode.value = node || null
    return
  }

  // MULTIPLE MODE (cascade)
  const node = findNodeById(nodes.value, id)
  if (!node) return

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

  // Update parents
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
}



</script>

<template lang="pug">
button(@click="selectionMode = 'single'") Single
button(@click="selectionMode = 'multiple'") Multiple
TreeView(
  :nodes="nodes"
  :expandedKeys="expandedKeys"
  :selectedKeys="selectedKeys"
  :showCheckbox="selectionMode === 'multiple'"
  :filter="true"
  :filterBy="['label']"
  :filterMode="'lenient'"
  :isRoot="true"
  :selectionMode="selectionMode"
  :expandOnClick="expandOnClick"
  @toggle-expand="toggleExpand"
  @toggle-select="handleToggleSelect"
)
  template(#togglerIcon="{ node, expanded }")
    span.toggle {{ expanded ? '-' : '+' }}

  template(#nodeLabel="{ node }")
    span {{ node.label }}

div(v-if="tempSelectedNode")
  h3 Selected Node:
  pre {{ tempSelectedNode }}

</template>

<style scoped>


</style>



