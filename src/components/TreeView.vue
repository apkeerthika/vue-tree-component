<script setup lang="ts">
import type { TreeNode } from '@/types/TreeNode';
import { isExpanded, isChecked, hasChildren, isIndeterminate, isFullyChecked, isPartiallyChecked } from '@/components/treeHelpers';
import { vIndeterminate } from '@/directives/indeterminate';

defineOptions({ name: 'TreeView'})

const props = defineProps<{
  nodes: TreeNode[],
  expandedKeys: string[],
  selectedKeys: string[],
  showCheckbox: boolean,
  searchText?: string,
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

function onKeydown(e: KeyboardEvent, node: TreeNode) {
  if (!hasChildren(node)) return

  if (['Enter', ' '].includes(e.key)) {
    e.preventDefault()
    onExpand(node)
  }

  if (e.key === 'ArrowRight' && !isExpanded(node.id, props.expandedKeys)) {
    onExpand(node)
  }

  if (e.key === 'ArrowLeft' && isExpanded(node.id, props.expandedKeys)) {
    onExpand(node)
  }
}


</script>

<template lang="pug">
ul.tree(role="tree")
  li(v-for="node in nodes || []" :key="node.id" role="treeitem" :aria-expanded="isExpanded(node.id, expandedKeys)")
    .node-row(tabIndex="0" @keydown="(e) => onKeydown(e, node)")
      span.toggle(v-if="hasChildren(node)" role="button" aria-label="Toggle" @click="onExpand(node)") {{ isExpanded(node.id, expandedKeys) ? '-' : '+' }}

      input(
        v-if="showCheckbox" 
        type="checkbox" 
        :checked="isFullyChecked(node, selectedKeys)" 
        v-indeterminate="isPartiallyChecked(node, selectedKeys)"
        @change="onCheck(node, $event)"
      )
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
      template(#togglerIcon="slotProps")
        slot(name="togglerIcon" v-bind="slotProps")

      template(#nodeLabel="slotProps")
        slot(name="nodeLabel" v-bind="slotProps") 
</template>

<style scoped>
.tree {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tree ul {
  margin-left: 20px;
}

.node-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 4px;
}

.node-row:hover {
  background-color: #f3f4f6;
}

.node-row:focus {
  outline: 2px solid #ebebeb;
}

.toggle {
  cursor: pointer;
  width: 16px;
  text-align: center;
  font-weight: bold;
}

.label {
  cursor: default;
}
</style>