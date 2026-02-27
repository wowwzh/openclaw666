"""
对称二叉树 - LeetCode 101
解题思路: 递归比较左右子树
时间复杂度: O(n)
空间复杂度: O(h) 递归栈深度
"""

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def isSymmetric(root):
    """判断二叉树是否对称"""
    if not root:
        return True
    
    def compare(left, right):
        # 都是空 -> 对称
        if not left and not right:
            return True
        # 只有一个为空 -> 不对称
        if not left or not right:
            return False
        # 值不同 -> 不对称
        if left.val != right.val:
            return False
        # 递归比较: 左的左 vs 右的右, 左的右 vs 右的左
        return compare(left.left, right.right) and compare(left.right, right.left)
    
    return compare(root.left, root.right)


def isSymmetric_iterative(root):
    """迭代版本 - 使用队列"""
    if not root:
        return True
    
    from collections import deque
    queue = deque([root.left, root.right])
    
    while queue:
        left = queue.popleft()
        right = queue.popleft()
        
        # 两个都为空，继续
        if not left and not right:
            continue
        
        # 只有一个为空，不对称
        if not left or not right:
            return False
        
        # 值不同，不对称
        if left.val != right.val:
            return False
        
        # 入队: 左的左 vs 右的右, 左的右 vs 右的左
        queue.append(left.left)
        queue.append(right.right)
        queue.append(left.right)
        queue.append(right.left)
    
    return True


def test_isSymmetric():
    # 测试1: 对称二叉树
    #     1
    #    / \
    #   2   2
    #  / \ / \
    # 3  4 4  3
    root1 = TreeNode(1)
    root1.left = TreeNode(2)
    root1.right = TreeNode(2)
    root1.left.left = TreeNode(3)
    root1.left.right = TreeNode(4)
    root1.right.left = TreeNode(4)
    root1.right.right = TreeNode(3)
    assert isSymmetric(root1) == True, "Test1 failed"
    
    # 测试2: 不对称
    #     1
    #    / \
    #   2   2
    #    \   \
    #     3    3
    root2 = TreeNode(1)
    root2.left = TreeNode(2)
    root2.right = TreeNode(2)
    root2.left.right = TreeNode(3)
    root2.right.right = TreeNode(3)
    assert isSymmetric(root2) == False, "Test2 failed"
    
    # 测试3: 单节点
    root3 = TreeNode(1)
    assert isSymmetric(root3) == True, "Test3 failed"
    
    # 测试4: 空树
    assert isSymmetric(None) == True, "Test4 failed"
    
    # 测试5: 迭代版本
    assert isSymmetric_iterative(root1) == True, "Test5 failed"
    assert isSymmetric_iterative(root2) == False, "Test6 failed"
    
    print("All tests passed!")


if __name__ == "__main__":
    test_isSymmetric()
    
    # 演示
    root = TreeNode(1)
    root.left = TreeNode(2)
    root.right = TreeNode(2)
    root.left.left = TreeNode(3)
    root.left.right = TreeNode(4)
    root.right.left = TreeNode(4)
    root.right.right = TreeNode(3)
    
    print(f"Is symmetric (recursive): {isSymmetric(root)}")
    print(f"Is symmetric (iterative): {isSymmetric_iterative(root)}")
