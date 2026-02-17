<script setup lang="ts">
import { computed } from 'vue'
import type { TreeNode } from '@/types/TreeNode'
import { useTreeFilter } from '@/composables/useTreeFilter'
import { vIndeterminate } from '@/directives/indeterminate'
import { isExpanded } from '@/components/helpers/treeHelpers'
import TreeNodeItem from './TreeNodeItem.vue'

defineOptions({ name: 'TreeView' })

const props = defineProps<{
  nodes: TreeNode[]
  expandedKeys: string[]
  selectedKeys: string[]
  filter?: boolean
  filterBy?: string | string[]
  filterMode?: 'lenient' | 'strict'
  isRoot?: boolean
  selectionMode?: 'single' | 'multiple'
  expandOnClick?: boolean
  showCheckbox?: boolean
  inheritRules?: boolean
}>()

const emit = defineEmits<{
  'toggle-expand': [id: string]
  'toggle-select': [node: TreeNode, checked: boolean]
}>()

/* Filter composable */
const {
  searchText,
  filteredNodes,
  computedExpandedKeys,
  showNoResults,
  resultCount,
  clearSearch
} = useTreeFilter(props)

/* Selection mode */
const mode = computed(() => props.selectionMode ?? 'multiple')
</script>

<template lang="pug">
.tree-wrapper
  div.search-container(v-if="filter && isRoot")
    input(
      type="text"
      placeholder="Search..."
      v-model="searchText"
    )

    svg.search-icon(
      v-if="!searchText"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
    )
      path(d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z")

    button.clear-btn(
      v-if="searchText"
      type="button"
      @click="clearSearch"
      aria-label="Clear search"
    ) ✕

  div.result-count(
    v-if="filter && isRoot && searchText"
  )
    | {{ resultCount }} result{{ resultCount === 1 ? '' : 's' }} found
  ul.tree(role="tree" v-if="!showNoResults")
    TreeNodeItem(
      v-for="node in filteredNodes || []"
      :key="node.id"
      :node="node"
      :expandedKeys="props.expandedKeys"
      :computedExpandedKeys="computedExpandedKeys"
      :selectedKeys="props.selectedKeys"
      :searchText="searchText"
      :selectionMode="props.selectionMode"
      :showCheckbox="props.showCheckbox"
      @toggle-expand="id => emit('toggle-expand', id)"
      @toggle-select="(node, checked) => emit('toggle-select', node, checked)"
    )
      template(#togglerIcon="slotProps")
        slot(name="togglerIcon" v-bind="slotProps")

      template(#nodeLabel="slotProps")
        slot(name="nodeLabel" v-bind="slotProps")

  Transition(name="fade")
    .no-results(v-if="showNoResults")
      | No results found for "{{ searchText }}"
</template>

<style scoped>
.tree {
  list-style: none;
  padding: 0;
  margin: 0;
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

.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.clear-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #888;
  padding: 0 4px;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.clear-btn:hover {
  color: #333;
  opacity: 1;
}

.result-count {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}
</style>
