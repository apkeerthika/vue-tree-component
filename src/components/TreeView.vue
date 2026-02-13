<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TreeNode } from '@/types/TreeNode';
import { isExpanded, isChecked, hasChildren, isIndeterminate, isFullyChecked, isPartiallyChecked, filterTree, collectExpandedIds, highlightText } from '@/components/treeHelpers';
import { vIndeterminate } from '@/directives/indeterminate';

defineOptions({ name: 'TreeView'})

const props = defineProps<{
  nodes: TreeNode[],
  expandedKeys: string[],
  selectedKeys: string[],
  showCheckbox: boolean,
  filter?: boolean,
  filterBy?: string | string[],
  filterMode?: 'lenient' | 'strict'
  isRoot?: boolean
}>()

const searchText = ref('')


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

const filteredNodes = computed<TreeNode[]>(() => {
  if (!props.filter || !searchText.value.trim()) {
    return props.nodes
  }

  return filterTree(props.nodes, searchText.value, {
    filterBy: props.filterBy ?? 'label',
    filterMode: props.filterMode ?? 'lenient'
  })
})

const computedExpandedKeys = computed<string[]>(() => {
  if (!searchText.value.trim()) {
    return props.expandedKeys
  }

  return collectExpandedIds(filteredNodes.value)
})

const showNoResults = computed(() => {
  return (
    props.filter &&
    searchText.value.trim().length > 0 &&
    filteredNodes.value.length === 0
  )
})


</script>

<template lang="pug">
.tree-wrapper
  div.search-container(v-if="filter && isRoot")
    input(type="text" placeholder="Search..." v-model="searchText")
    svg.search-icon(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20")
      path(d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z")
  ul.tree(role="tree" v-if="!showNoResults")
    li(v-for="node in filteredNodes || []" :key="node.id" role="treeitem" :aria-expanded="isExpanded(node.id, computedExpandedKeys)")
      .node-row(tabIndex="0" @keydown="(e) => onKeydown(e, node)")
        span.toggle(v-if="hasChildren(node)" role="button" aria-label="Toggle" @click="onExpand(node)") {{ isExpanded(node.id, computedExpandedKeys) ? '-' : '+' }}

        input(
          v-if="showCheckbox" 
          type="checkbox" 
          :checked="isFullyChecked(node, selectedKeys)" 
          v-indeterminate="isPartiallyChecked(node, selectedKeys)"
          @change="onCheck(node, $event)"
        )
        slot(name="nodeLabel" :node="node")
          span(v-html="highlightText(node.label, searchText)")
      TreeView(
        v-if="hasChildren(node) && isExpanded(node.id, computedExpandedKeys)"
        :nodes="node.children"
        :expandedKeys="computedExpandedKeys"
        :selectedKeys="selectedKeys"
        :showCheckbox="showCheckbox"
        :filter="filter"
        :filterBy="filterBy"
        :filterMode="filterMode"
        :isRoot="false"
        @toggle-expand="id => emit('toggle-expand', id)"
        @toggle-select="(id, checked) => emit('toggle-select', id, checked)"
      )
        template(#togglerIcon="slotProps")
          slot(name="togglerIcon" v-bind="slotProps")

        template(#nodeLabel="slotProps")
          slot(name="nodeLabel" v-bind="slotProps") 
  .no-results(v-else)
    | No results found for "{{ searchText }}"
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

.search-container {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  max-width: 500px;
  margin-bottom: 8px;
  background-color: #fff;
  transition: box-shadow 0.2s ease;
}

.search-container:focus-within {
  box-shadow: 0 0 5px rgba(100, 150, 250, 0.5);
  border-color: #6496fa;
}

.search-container input {
  border: none;
  outline: none;
  flex: 1;
  padding-left: 6px;
  font-size: 14px;
}

.search-container svg.search-icon {
  fill: #888;
}
.no-results {
  padding: 12px;
  color: #888;
  font-size: 14px;
  font-style: italic;
}
</style>