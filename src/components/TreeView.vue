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
}>()

const emit = defineEmits<{
  (e: 'toggle-expand', id: string): void
  (e: 'toggle-select', id: string): void
}>()


</script>

<template lang="pug">
ul.tree
    li(v-for="node in props.nodes" :key="node.id")
        .node-row
            span.toggle(v-if="node._originalChildren && node._originalChildren.length > 0" @click="emit('toggle-expand', node.id)")
                | {{ expandedKeys.has(node.id) ? '📂' : '📁' }}
            span.icon(v-else)
                | 📄
            span.label| {{ node.label }}
            input(
              v-if="props.showCheckbox && (!node._originalChildren || node._originalChildren.length === 0)" 
              type="checkbox" 
              @change="emit('toggle-select', node.id)" 
              :checked="props.selectedKeys.includes(node.id)"
            )

        TreeView(
            v-if="node._originalChildren && node._originalChildren.length > 0 && expandedKeys.has(node.id)"
            :key="node.id"
            :nodes="node.children"
            :selectedKeys="props.selectedKeys"
            :expandedKeys="props.expandedKeys"
            :showCheckbox="props.showCheckbox"
            :selectionMode="props.selectionMode"
            @toggle-select="emit('toggle-select', $event)"
            @toggle-expand="emit('toggle-expand', $event)"
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