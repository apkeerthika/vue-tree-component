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
const tempSelectedNodes = ref<TreeNode[]>([])

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
  const node = findNodeById(nodes.value, id)
  if (!node) return

  if (selectionMode.value === 'single') {
    selectedKeys.value = [id]
    tempSelectedNode.value = node || null
    tempSelectedNodes.value = []
    return
  }

  // MULTIPLE MODE (cascade)
  const descendantIds = collectDescendantIds(node)
  const path = findPath(nodes.value, id)

  const newSelected = new Set(selectedKeys.value)

  if (checked) {
    newSelected.add(id)
    descendantIds.forEach(d => newSelected.add(d))

    const toAdd = [node, ...descendantIds.map(id => findNodeById(nodes.value, id))].filter((n): n is TreeNode => !!n)
    toAdd.forEach(n => {
      if(!tempSelectedNodes.value.find(existing => existing.id === n.id)) {
        tempSelectedNodes.value.push(n)
      }
    })
  } else {
    newSelected.delete(id)
    descendantIds.forEach(d => newSelected.delete(d))

    const toRemoveIds = [node, ...descendantIds]
    tempSelectedNodes.value = tempSelectedNodes.value.filter(n => !toRemoveIds.includes(n.id))
  }

  // Update parents
  path.slice(0, -1).reverse().forEach(parent => {
    const childIds = collectDescendantIds(parent)
    const selectedChildren = childIds.filter(c => newSelected.has(c))

    if (selectedChildren.length === childIds.length) {
      newSelected.add(parent.id)
    } else if(selectedChildren.length > 0) {
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
  :filter="true"
  :filterBy="['label']"
  :filterMode="'lenient'"
  :isRoot="true"
  :selectionMode="selectionMode"
  :expandOnClick="expandOnClick"
  @toggle-expand="toggleExpand"
  :showCheckbox="selectionMode === 'multiple'"
  @toggle-select="handleToggleSelect"
)
  template(#togglerIcon="{ node, expanded }")
    span.toggle {{ expanded ? '-' : '+' }}

  template(#nodeLabel="{ node }")
    span {{ node.label }}

div(v-if="selectionMode === 'single' && tempSelectedNode")
  h3 Single Selected Node:
  p {{ tempSelectedNode.label }}

div(v-if="selectionMode === 'multiple' && tempSelectedNodes.length")
  h3 Multi Selected Nodes:
  ul
    li(v-for="n in tempSelectedNodes" :key="n.id") {{ n.label }}

</template>

<style scoped>


</style>



