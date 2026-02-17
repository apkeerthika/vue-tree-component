<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TreeNode } from '@/types/TreeNode'
import { treeData } from '@/data/treeData'
import { useTreeSelection } from '@/composables/useTreeSelection'
import { TreeView } from '@/components/tree'
import { useTreeExpansion } from '@/composables/useTreeExpansion' 

const nodes = ref<TreeNode[]>(treeData)
const { 
  selectionMode, 
  inheritRules, 
  selectedKeys, 
  tempSelectedNode, 
  tempSelectedNodes, 
  toggleSelect, 
} = useTreeSelection(nodes)
const { expandedKeys, toggleExpand } = useTreeExpansion(nodes)



</script>

<template lang="pug">
button(@click="selectionMode = 'single'") Single
button(@click="selectionMode = 'multiple'") Multiple
label
  input(type="checkbox" v-model="inheritRules")
  | Enable Inheritance

TreeView(
  :nodes="nodes"
  :expandedKeys="expandedKeys"
  :selectedKeys="selectedKeys"
  :filter="true"
  :filterBy="['label']"
  :filterMode="'lenient'"
  :isRoot="true"
  :selectionMode="selectionMode"
  @toggle-expand="toggleExpand"
  :showCheckbox="selectionMode === 'multiple'"
  @toggle-select="toggleSelect"
)
  template(#togglerIcon="{ node, expanded }")
    span.toggle(@click="toggleExpand(node)") {{ expanded ? '-' : '+' }}

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
button {
  margin-right: 8px;
  margin-bottom: 12px;
}
.toggle {
  font-weight: bold;
  cursor: pointer;
  margin-right: 4px;
}
</style>



