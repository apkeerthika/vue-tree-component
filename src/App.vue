<script setup lang="ts">
import { ref} from 'vue'
import TreeView from './components/TreeView.vue'
import type { TreeNode } from './types/TreeNode'
import { treeData } from './data/treeData'

const nodes = ref<TreeNode[]>(treeData)

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

function toggleSelect(id: string, checked: boolean) {
  if (checked && !selectedKeys.value.includes(id)) {
    selectedKeys.value.push(id)
  } else if (!checked) {
    selectedKeys.value = selectedKeys.value.filter(k => k !== id)
  }
}

</script>

<template lang="pug">
  TreeView(
    :nodes="nodes"
    :expandedKeys="expandedKeys"
    :selectedKeys="selectedKeys"
    :showCheckbox="true"
    @toggle-expand="toggleExpand"
    @toggle-select="toggleSelect"
  )
    template(#togglerIcon="{ node, expanded, toggle }")
      span.toggle(@click="toggle") {{ expanded ? '−' : '+' }}

    template(#nodeLabel="{ node }")
      span {{ node.label }}

</template>


