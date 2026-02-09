<script setup lang="ts">
import type { TreeNode } from '@/types/TreeNode';

defineOptions({
  name: 'TreeView'
})

const props = defineProps<{
    nodes: TreeNode[];
    selectedKeys: string[],
    expandedKeys: Set<string>
    showCheckbox: boolean;
    selectionMode: 'single' | 'multiple';
    searchText: string
}>()

const emit = defineEmits<{
  (e: 'toggle-expand', id: string): void
  (e: 'toggle-select', id: string): void
}>()

function highlightMatch(label: string, query: string) {
  if (!query) return label
  const regex = new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi')
  return label.replace(regex, '<span class="highlight">$1</span>')
}

function onCheckboxChange(node: TreeNode) {
  if (props.selectionMode === 'single') {
    emit('toggle-select', node.id)
  } else {
    const index = props.selectedKeys.indexOf(node.id)
    if (index > -1) props.selectedKeys.splice(index, 1)
    else props.selectedKeys.push(node.id)
  }
}

function isIndeterminate(node: TreeNode): boolean { 
  if (!node._originalChildren || node._originalChildren.length === 0) return false
  const childIds = collectChildIds(node) 
  const selectedChildren = childIds.filter(id => props.selectedKeys.includes(id))
  return selectedChildren.length > 0 && selectedChildren.length < childIds.length 
}

function collectChildIds(node: TreeNode): string[] {
  if (!node._originalChildren || node._originalChildren.length === 0) return []
  return node._originalChildren.flatMap(child => [child.id, ...collectChildIds(child)])
}


</script>

<template lang="pug">
ul.tree
    li(v-for="node in props.nodes" :key="node.id" :class="{ highlight: searchText && node.label.toLowerCase().includes(searchText.toLowerCase()) }")
        .node-row
            span.toggle(v-if="node._originalChildren && node._originalChildren.length > 0" @click="emit('toggle-expand', node.id)")
                | {{ expandedKeys.has(node.id) ? '📂' : '📁' }}
            span.icon(v-else)
                | 📄
            span.label(v-html="highlightMatch(node.label, searchText)")
            input(
              v-if="props.showCheckbox" 
              type="checkbox" 
              @change="emit('toggle-select', node.id, $event.target.checked)"
              :checked="props.selectedKeys.includes(node.id)"
              :indeterminate="isIndeterminate(node)"
            )

        TreeView(
            v-if="node._originalChildren && node._originalChildren.length > 0 && expandedKeys.has(node.id)"
            :key="node.id"
            :nodes="node.children"
            :selectedKeys="props.selectedKeys"
            :expandedKeys="props.expandedKeys"
            :showCheckbox="props.showCheckbox"
            :selectionMode="props.selectionMode"
            :searchText="props.searchText"
            @toggle-select="emit('toggle-select', $event)"
            @toggle-expand="emit('toggle-expand', $event)"
        )

</template>

<style scoped>
ul.tree ul.tree { margin-left: 20px; /* nested levels get extra margin */ }
.tree {
  list-style: none;
  padding: 0;
}

.node-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.toggle {
  cursor: pointer;
  font-weight: bold;
  width: 16px;
  display: inline-block;
}

.icon {
  width: 20px;
  display: inline-block;
}

.label {
  cursor: default;
}

li.highlight .node-row { background-color: #f0f0f0; border-radius: 4px; padding: 3px; } 
.label .highlight { background-color: yellow; font-weight: bold; border-radius: 4px; padding: 2px; }
</style>