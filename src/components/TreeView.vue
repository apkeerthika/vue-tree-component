<script setup lang="ts">
import type { TreeNode } from '@/types/TreeNode';
import { isExpanded, isChecked, hasChildren, isIndeterminate, isFullyChecked } from '@/components/treeHelpers';

defineOptions({ name: 'TreeView'})

const props = defineProps<{
  nodes: TreeNode[],
  expandedKeys: string[],
  selectedKeys: string[],
  showCheckbox: boolean,
  searchText?: string
}>()

const emit = defineEmits<{
  'toggle-expand': [id: string],
  'toggle-select': [id: string, checked: boolean]
}>()

function onExpand(node: TreeNode) {
  emit('toggle-expand', node.id)
}

function onCheck(node: TreeNode, e:Event) {
  const target = e.target as HTMLInputElement
  emit('toggle-select', node.id, target.checked)
}

</script>

<template lang="pug">
ul.tree
  li(v-for="node in nodes || []" :key="node.id")
    .node-row
      slot(name="togglerIcon" :node="node" :expanded="isExpanded(node.id, expandedKeys)" :toggle="() => onExpand(node)")
        span.toggle(@click="onExpand(node)") {{ isExpanded(node.id, expandedKeys) ? '-' : '+' }}

      input(v-if="showCheckbox" type="checkbox" :checked="isFullyChecked(node, selectedKeys)" :indeterminate="isIndeterminate(node, selectedKeys)" @change="onCheck(node, $event)")
      slot(name="nodeLabel" :node="node")
        span {{ node.label }}
    TreeView(
      v-if="hasChildren(node) && isExpanded(node.id, expandedKeys)"
      :nodes="node.children"
      :expandedKeys="expandedKeys"
      :selectedKeys="selectedKeys"
      :showCheckbox="showCheckbox"
      :searchText="searchText"
      @toggle-expand="id => emit('toggle-expand', id)"
      @toggle-select="(id, checked) => emit('toggle-select', id, checked)"
    )
</template>

<style scoped>
.tree,
.tree ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

ul.tree ul.tree {
  margin-left: 20px;
}

.node-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.toggle {
  cursor: pointer;
  width: 16px;
  display: inline-block;
}
</style>