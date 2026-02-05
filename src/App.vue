<script setup lang="ts">
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
</script>

<template lang="pug">
  TreeView(:nodes="sampleData" :showCheckbox="true" selectionMode="multiple")
</template>

<style scoped>

</style>
