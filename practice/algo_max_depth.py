"""
二叉树最大深度 - LeetCode 104
解题思路：递归 DFS
时间复杂度: O(n)
空间复杂度: O(h) h为树的高度
"""

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def maxDepth(root):
    """计算二叉树的最大深度"""
    if not root:
        return 0
    
    # 递归计算左右子树的高度
    left_depth = maxDepth(root.left)
    right_depth = maxDepth(root.right)
    
    # 返回较大值 + 1（当前节点）
    return max(left_depth, right_depth) + 1


def maxDepth_iterative(root):
    """迭代版本 - 使用层序遍历 BFS"""
    if not root:
        return 0
    
    from collections import deque
    queue = deque([root])
    depth = 0
    
    while queue:
        depth += 1
        level_size = len(queue)
        
        for _ in range(level_size):
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    
    return depth


# 测试用例
def test_maxDepth():
    # 测试1: 普通二叉树
    #       3
    #      / \
    #     9  20
    #       /  \
    #      15   7
    root1 = TreeNode(3)
    root1.left = TreeNode(9)
    root1.right = TreeNode(20)
    root1.right.left = TreeNode(15)
    root1.right.right = TreeNode(7)
    assert maxDepth(root1) == 3, "Test1 failed"
    
    # 测试2: 空树
    assert maxDepth(None) == 0, "Test2 failed"
    
    # 测试3: 单节点
    root3 = TreeNode(1)
    assert maxDepth(root3) == 1, "Test3 failed"
    
    # 测试4: 只有左子树
    root4 = TreeNode(1)
    root4.left = TreeNode(2)
    root4.left.left = TreeNode(3)
    assert maxDepth(root4) == 3, "Test4 failed"
    
    # 测试5: 迭代版本
    assert maxDepth_iterative(root1) == 3, "Test5 failed"
    
    print("All tests passed!")


if __name__ == "__main__":
    test_maxDepth()
    
    # 演示
    root = TreeNode(1)
    root.left = TreeNode(2)
    root.right = TreeNode(3)
    root.left.left = TreeNode(4)
    root.left.right = TreeNode(5)
    
    print(f"二叉树最大深度(递归): {maxDepth(root)}")
    print(f"二叉树最大深度(迭代): {maxDepth_iterative(root)}")
