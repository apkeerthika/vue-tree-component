<script setup lang="ts">
import { ref } from 'vue';
import TreeView from './components/TreeView.vue';
import type { TreeNode } from './types/TreeNode';

const sampleData: TreeNode[] = [
    {
        id: '1',
        label: 'Electronics',
        children: [
            {
                id: '1-1',
                label: 'Phones',
                children: [
                    { id: '1-1-1', label: 'iPhone' },
                    { id: '1-1-2', label: 'Samsung' }
                ]
            },
            { id: '1-2', label: 'Laptops' }
        ]
    },
    {
        id: '2',
        label: 'Books'
    }
];

const selectedKeys = ref<string[]>([])

function onToggleSelect(id: string) {
  const index = selectedKeys.value.indexOf(id)

  if (index > -1) {
    selectedKeys.value.splice(index, 1)
  } else {
    selectedKeys.value.push(id)
  }
}

</script>

<template lang="pug">
  TreeView(:nodes="sampleData" :showCheckbox="true" selectionMode="multiple" :selectedKeys="selectedKeys"  @toggle-select="onToggleSelect")
  p Selected IDs:
    ul
     li(v-for="id in selectedKeys" :key="id") {{ id }}
</template>

<style scoped>

</style>
