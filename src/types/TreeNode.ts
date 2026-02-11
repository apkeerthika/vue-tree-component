export interface TreeNode {
    // Unique identifier for the node
    id: string;
    // Display label for the node
    label: string;
    // Child nodes
    children?: TreeNode[];
}