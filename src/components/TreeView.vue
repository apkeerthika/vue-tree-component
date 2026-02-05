<script setup lang="ts">
import { ref } from 'vue';
import type { TreeNode } from '@/types/TreeNode';

defineOptions({
  name: 'TreeView'
})

const props = defineProps<{
    nodes: TreeNode[];
    showCheckbox: boolean;
    selectionMode: 'single' | 'multiple';
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
        span(@click="toggleExpand(node.id)") {{ node.label }}


        TreeView(
            v-if="node.children && expandedKeys.has(node.id)"
            :nodes="node.children"
            :showCheckbox="props.showCheckbox"
            :selectionMode="props.selectionMode"
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

.label {
  cursor: default;
}
</style>