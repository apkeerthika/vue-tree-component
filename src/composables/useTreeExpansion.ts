import { ref, type Ref } from 'vue'
import type { TreeNode } from '@/types/TreeNode'

export function useTreeExpansion(
    nodes: Ref<TreeNode[]>
) {
    const expandedKeys = ref<string[]>([])

    function toggleExpand(node: TreeNode) {
        const id = node.id
        if (expandedKeys.value.includes(id)) {
            expandedKeys.value = expandedKeys.value.filter(key => key !== id)
        } else {
            expandedKeys.value.push(id)
        }
    }

    /* collect expanded ids */
    function collectExpandedIds(nodes: TreeNode[]): string[] {
        const ids: string[] = []
        function walk(list: TreeNode[]) {
            for (const node of list) {
                if(node.children && node.children.length > 0) {
                    ids.push(node.id)
                    walk(node.children)
                }
            }
        }
        walk(nodes)
        return ids
    }

    function expandAll() {
        expandedKeys.value = collectExpandedIds(nodes.value)
    }

    return {
        expandedKeys,
        toggleExpand,
        collectExpandedIds,
        expandAll
    }
}