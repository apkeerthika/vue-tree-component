export interface TreeNode {
    // Unique identifier for the node
    id: string;
    // Display label for the node
    label: string;
    // Child nodes
    children?: TreeNode[];
    _originalChildren?: TreeNode[];
    // Whether the node is expanded
    expanded?: boolean;
    // Whether the node is selected
    selected?: boolean;
}