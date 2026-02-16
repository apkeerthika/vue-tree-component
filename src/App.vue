<script setup lang="ts">
import { ref, computed } from 'vue'
import TreeView from './components/TreeView.vue'
import type { TreeNode } from './types/TreeNode'
import { treeData } from './data/treeData'
import { useTreeSelection } from './composables/useTreeSelection'

const nodes = ref<TreeNode[]>(treeData)

const expandOnClick = ref(false)
const expandedKeys = ref<string[]>([])

const {
  selectionMode,
  selectedKeys,
  tempSelectedNode,
  tempSelectedNodes,
  toggleSelect
} = useTreeSelection(nodes)

function toggleExpand(id: string) {
  const i = expandedKeys.value.indexOf(id)
  if (i > -1) {
    expandedKeys.value.splice(i, 1)
  } else {
    expandedKeys.value.push(id)
  }
}

function handleToggleSelect(node: TreeNode, checked: boolean) {
  toggleSelect(node, checked)
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



