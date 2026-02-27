"""
二叉树遍历 - 前序/中序/后序遍历
LeetCode: 144, 94, 145
解题思路: 递归 + 迭代
时间复杂度: O(n)
空间复杂度: O(h)
"""

from typing import Optional, List


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


# ==================== 递归版本 ====================

def preorder_recursive(root: Optional[TreeNode]) -> List[int]:
    """前序遍历: 根 -> 左 -> 右"""
    if not root:
        return []
    return [root.val] + preorder_recursive(root.left) + preorder_recursive(root.right)


def inorder_recursive(root: Optional[TreeNode]) -> List[int]:
    """中序遍历: 左 -> 根 -> 右"""
    if not root:
        return []
    return inorder_recursive(root.left) + [root.val] + inorder_recursive(root.right)


def postorder_recursive(root: Optional[TreeNode]) -> List[int]:
    """后序遍历: 左 -> 右 -> 根"""
    if not root:
        return []
    return postorder_recursive(root.left) + postorder_recursive(root.right) + [root.val]


# ==================== 迭代版本 ====================

def preorder_iterative(root: Optional[TreeNode]) -> List[int]:
    """前序遍历迭代 - 使用栈"""
    if not root:
        return []
    
    result = []
    stack = [root]
    
    while stack:
        node = stack.pop()
        result.append(node.val)
        
        # 右先入栈，左后入栈（栈LIFO，所以先处理左）
        if node.right:
            stack.append(node.right)
        if node.left:
            stack.append(node.left)
    
    return result


def inorder_iterative(root: Optional[TreeNode]) -> List[int]:
    """中序遍历迭代 - 使用栈"""
    result = []
    stack = []
    current = root
    
    while current or stack:
        # 一直左走到尽头
        while current:
            stack.append(current)
            current = current.left
        
        # 处理栈顶节点
        current = stack.pop()
        result.append(current.val)
        
        # 转向右子树
        current = current.right
    
    return result


def postorder_iterative(root: Optional[TreeNode]) -> List[int]:
    """后序遍历迭代 - 使用栈标记"""
    if not root:
        return []
    
    result = []
    stack = [(root, False)]  # (node, visited)
    
    while stack:
        node, visited = stack.pop()
        
        if not node:
            continue
        
        if visited:
            result.append(node.val)
        else:
            # 入栈顺序: 根 -> 右 -> 左
            # 出栈顺序: 左 -> 右 -> 根 (后序)
            stack.append((node, True))
            stack.append((node.right, False))
            stack.append((node.left, False))
    
    return result


def level_order(root: Optional[TreeNode]) -> List[List[int]]:
    """层序遍历 - 使用队列"""
    if not root:
        return []
    
    from collections import deque
    result = []
    queue = deque([root])
    
    while queue:
        level = []
        level_size = len(queue)
        
        for _ in range(level_size):
            node = queue.popleft()
            level.append(node.val)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        result.append(level)
    
    return result


def test_traversals():
    #     1
    #    / \
    #   2   3
    #  / \
    # 4   5
    root = TreeNode(1)
    root.left = TreeNode(2)
    root.right = TreeNode(3)
    root.left.left = TreeNode(4)
    root.left.right = TreeNode(5)
    
    # 前序: 1 2 4 5 3
    assert preorder_recursive(root) == [1, 2, 4, 5, 3], "Preorder test failed"
    assert preorder_iterative(root) == [1, 2, 4, 5, 3], "Preorder iterative failed"
    
    # 中序: 4 2 5 1 3
    assert inorder_recursive(root) == [4, 2, 5, 1, 3], "Inorder test failed"
    assert inorder_iterative(root) == [4, 2, 5, 1, 3], "Inorder iterative failed"
    
    # 后序: 4 5 2 3 1
    assert postorder_recursive(root) == [4, 5, 2, 3, 1], "Postorder test failed"
    assert postorder_iterative(root) == [4, 5, 2, 3, 1], "Postorder iterative failed"
    
    # 层序: [[1], [2,3], [4,5]]
    assert level_order(root) == [[1], [2, 3], [4, 5]], "Level order test failed"
    
    print("All traversal tests passed!")


if __name__ == "__main__":
    test_traversals()
    
    # 演示
    root = TreeNode(1)
    root.left = TreeNode(2)
    root.right = TreeNode(3)
    root.left.left = TreeNode(4)
    root.left.right = TreeNode(5)
    
    print(f"Preorder (recursive):  {preorder_recursive(root)}")
    print(f"Preorder (iterative): {preorder_iterative(root)}")
    print(f"Inorder (recursive):   {inorder_recursive(root)}")
    print(f"Inorder (iterative):  {inorder_iterative(root)}")
    print(f"Postorder (recursive): {postorder_recursive(root)}")
    print(f"Postorder (iterative):{postorder_iterative(root)}")
    print(f"Level order:          {level_order(root)}")
