<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TreeNode } from '@/types/TreeNode';
import { isExpanded, hasChildren,  isFullyChecked, isPartiallyChecked, highlightText } from '@/components/treeHelpers';
import { vIndeterminate } from '@/directives/indeterminate';
import { useTreeFilter } from '@/composables/useTreeFilter'


defineOptions({ name: 'TreeView'})

const props = defineProps<{
  nodes: TreeNode[],
  expandedKeys: string[],
  selectedKeys: string[],
  filter?: boolean,
  filterBy?: string | string[],
  filterMode?: 'lenient' | 'strict'
  isRoot?: boolean,
  selectionMode?: 'single' | 'multiple',
  expandOnClick?: boolean
  showCheckbox?: boolean
}>()

const { searchText, filteredNodes, computedExpandedKeys, showNoResults, resultCount, clearSearch } = useTreeFilter(props)

const mode = computed(() => props.selectionMode ?? 'multiple')


const emit = defineEmits<{
  'toggle-expand': [id: string],
  'toggle-select': [node: TreeNode, checked: boolean]
}>()

function onExpand(node: TreeNode) {
  emit('toggle-expand', node.id)
}

function onCheck(node: TreeNode, e:Event) {
  const target = e.target as HTMLInputElement
  const checked = mode.value === 'single' ? true : target.checked
  emit('toggle-select', node, checked)
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

function handleRowClick(node: TreeNode, e: MouseEvent) {
  if((e.target as HTMLElement).tagName === 'INPUT') return

  if(mode.value === 'single') {
    emit('toggle-select', node, true)
  } else {
    const checked = !isFullyChecked(node, props.selectedKeys)
    emit('toggle-select', node, checked)
  }
}

function getRowClasses(node: TreeNode) {
  if(mode.value === 'single') {
    return {
      selected: props.selectedKeys.includes(node.id)
    }
  }
  return {
    selected: isFullyChecked(node, props.selectedKeys),
    partial: isPartiallyChecked(node, props.selectedKeys)
  }
}


</script>

<template lang="pug">
.tree-wrapper
  div.search-container(v-if="filter && isRoot")
    input(type="text" placeholder="Search..." v-model="searchText")
    svg.search-icon(v-if="!searchText" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20")
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
    li(v-for="node in filteredNodes || []" :key="node.id" role="treeitem" :aria-expanded="isExpanded(node.id, computedExpandedKeys)")
      .node-row(:class="getRowClasses(node)" tabIndex="0" @keydown="(e) => onKeydown(e, node)", @click="(e) => handleRowClick(node, e)")
        span.toggle(v-if="hasChildren(node)" role="button" aria-label="Toggle" @click="onExpand(node)") 
          slot(name="togglerIcon" :node="node", :expanded="isExpanded(node.id, computedExpandedKeys)")
            span.default-toggle(:class="{ expanded: isExpanded(node.id, computedExpandedKeys) }")  ▶
        span.toggle(v-else)

        template(v-if="showCheckbox && mode === 'multiple'")
          input(
            type="checkbox"
            :checked="isFullyChecked(node, selectedKeys)"
            v-indeterminate="isPartiallyChecked(node, selectedKeys)"
            @change="onCheck(node, $event)"
          )

        template(v-else)
          slot(name="nodeIcon" :node="node")
            span.default-icon
              | {{ hasChildren(node) ? '📁' : '📄' }}
        slot(name="nodeLabel" :node="node")
          span(v-html="highlightText(node.label, searchText)")
      TreeView(
        v-if="hasChildren(node) && isExpanded(node.id, computedExpandedKeys)"
        :nodes="node.children"
        :expandedKeys="computedExpandedKeys"
        :selectedKeys="selectedKeys"
        :filter="filter"
        :filterBy="filterBy"
        :filterMode="filterMode"
        :isRoot="false"
        :selectionMode="mode"
        :expandOnClick="expandOnClick"
        :showCheckbox="showCheckbox"
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

.tree ul {
  margin-left: 20px;
}

.node-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.node-row:hover {
  background: #f3f4f6; /* light gray */
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


.default-toggle {
  display: inline-block;
  font-size: 12px;
  transition: transform 0.2s ease;
}

.default-toggle.expanded {
  transform: rotate(90deg);
}

.node-row.selected {
  background: #e0f2fe;   /* soft blue */
  color: #0369a1;
  font-weight: 500;
}

.node-row.partial {
  background: #fef9c3; /* soft yellow */
}

</style>