<script setup lang="ts">
import type { TreeNode } from '@/types/TreeNode'
import { computed } from 'vue'
import { hasChildren, isFullyChecked, isIndeterminate, highlightText, isExpanded } from '@/components/helpers/treeHelpers'
import { vIndeterminate } from '@/directives/indeterminate'

defineOptions({ name: 'TreeNodeItem' })

const props = defineProps<{
  node: TreeNode
  expandedKeys?: string[]
  selectedKeys?: string[]
  computedExpandedKeys?: string[]
  searchText?: string
  selectionMode?: 'single' | 'multiple'
  showCheckbox?: boolean,
  level?: number
}>()

const emit = defineEmits<{
  'toggle-expand': (id: string) => void
  'toggle-select': (node: TreeNode, checked: boolean) => void
}>()

const mode = computed(() => props.selectionMode ?? 'multiple')

function onExpand() {
  emit('toggle-expand', props.node.id)
}

function onCheck(e: Event) {
  const target = e.target as HTMLInputElement
  const checked = mode.value === 'single' ? true : target.checked
  emit('toggle-select', props.node, checked)
}

function onKeydown(e: KeyboardEvent) {
  if (!hasChildren(props.node)) return

  if (['Enter', ' '].includes(e.key)) {
    e.preventDefault()
    onExpand()
  }

  if (e.key === 'ArrowRight' && !isExpanded(props.node.id, props.computedExpandedKeys)) {
    onExpand()
  }

  if (e.key === 'ArrowLeft' && isExpanded(props.node.id, props.computedExpandedKeys)) {
    onExpand()
  }
}

function handleRowClick(e: MouseEvent) {
  if ((e.target as HTMLElement).tagName === 'INPUT') return

  if (mode.value === 'single') {
    emit('toggle-select', props.node, true)
  } else {
    const checked = !isFullyChecked(props.node, props.selectedKeys)
    emit('toggle-select', props.node, checked)
  }
}

function getRowClasses() {
  if (mode.value === 'single') {
    return {
      selected: props.selectedKeys.includes(props.node.id)
    }
  }

  return {
    selected: isFullyChecked(props.node, props.selectedKeys ?? []),
    partial: isIndeterminate(props.node, props.selectedKeys ?? [])
  }
}
</script>

<template lang="pug">
li(role="treeitem", :aria-expanded="isExpanded(node.id, computedExpandedKeys)")
  .node-row(
    :class="getRowClasses()"
    :style="{ paddingLeft: `${(level ?? 0) * 16}px` }"
    tabIndex="0"
    @keydown="onKeydown"
    @click="handleRowClick"
  )
    span.toggle(
      v-if="hasChildren(node)"
      role="button"
      aria-label="Toggle"
      @click.stop="onExpand"
    )
      slot(name="togglerIcon", :node="node", :expanded="isExpanded(node.id, computedExpandedKeys)")
        svg(
          class="chevron"
          :class="{ expanded }"
          viewBox="0 0 24 24"
          width="14"
          height="14"
        )
          path(d="M8 5l8 7-8 7" fill="currentColor")
    span.toggle(v-else)

    template(v-if="showCheckbox && mode === 'multiple'")
      input(
        type="checkbox"
        :checked="isFullyChecked(node, selectedKeys)"
        v-indeterminate="isIndeterminate(node, selectedKeys)"
        @change="onCheck"
      )

    template(v-else)
      slot(name="nodeIcon", :node="node")
        span.default-icon
          | {{ hasChildren(node) ? '📁' : '📄' }}

    slot(name="nodeLabel", :node="node")
      span(v-html="highlightText(node.label, searchText)")

  ul(v-if="hasChildren(node) && isExpanded(node.id, computedExpandedKeys)")
    TreeNodeItem(
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :expandedKeys="props.expandedKeys"
      :computedExpandedKeys="props.computedExpandedKeys"
      :selectedKeys="props.selectedKeys"
      :searchText="props.searchText"
      :selectionMode="props.selectionMode"
      :showCheckbox="props.showCheckbox"
      @toggle-expand="$emit('toggle-expand', $event)"
      @toggle-select="(node, checked) => $emit('toggle-select', node, checked)"
      :level="(level ?? 0) + 1"
    )
      template(#togglerIcon="slotProps")
        slot(name="togglerIcon" v-bind="slotProps")

      template(#nodeLabel="slotProps")
        slot(name="nodeLabel" v-bind="slotProps")
</template>

