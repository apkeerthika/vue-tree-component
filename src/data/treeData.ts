import type { TreeNode } from "../types/TreeNode";

export const treeData: TreeNode[] = [
    {
        id: '1',
        label: 'Documents',
        children: [
            {
                id: '1-1',
                label: 'Work',
                children: [
                    { id: '1-1-1', label: 'Invoices' },
                    { id: '1-1-2', label: 'Reports' }
                ]
            },
            {
                id: '1-2',
                label: 'Personal',
                children: [
                    { id: '1-2-1', label: 'Photos' },
                    { id: '1-2-2', label: 'Videos' }
                ]
            }
        ]
    },
    {
        id: '2',
        label: 'Downloads',
        children: [
            { id: '2-1', label: 'Software' },
            { id: '2-2', label: 'Music' }
        ]
    },
    {
        id: '3',
        label: 'Empty Folder'
    }
]