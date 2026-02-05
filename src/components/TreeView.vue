<script setup lang="ts">
import { ref } from 'vue';
import type { TreeNode } from '@/types/TreeNode';

defineOptions({
  name: 'TreeView'
})

const props = defineProps<{
    nodes: TreeNode[];
    selectedKeys: string[]
    showCheckbox: boolean;
    selectionMode: 'single' | 'multiple';
}>()

const emit = defineEmits<{
  (e: 'toggle-select', id: string): void
}>()

const expandedKeys = ref<Set<string>>(new Set())


function toggleExpand(id: string) {
  if (expandedKeys.value.has(id)) {
    expandedKeys.value.delete(id)
  } else {
    expandedKeys.value.add(id)
  }
}


</script>

<template lang="pug">
ul.tree
    li(v-for="node in props.nodes" :key="node.id")
        .node-row
            span.toggle(v-if="node.children" @click="toggleExpand(node.id)")
                | {{ expandedKeys.has(node.id) ? '📂' : '📁' }}
            span.icon(v-else)
                | 📄
            span.label| {{ node.label }}
            input(v-if="props.showCheckbox && !node.children" type="checkbox" @change="emit('toggle-select', node.id)" :checked="props.selectedKeys.includes(node.id)")

        TreeView(
            v-if="node.children && expandedKeys.has(node.id)"
            :key="node.id"
            :nodes="node.children"
            :selectedKeys="props.selectedKeys"
            :showCheckbox="props.showCheckbox"
            :selectionMode="props.selectionMode"
            @toggle-select="emit('toggle-select', $event)"
        )

</template>

<style scoped>
.tree {
  list-style: none;
  padding-left: 16px;
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
</style>