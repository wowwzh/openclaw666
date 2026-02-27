# 算法练习 - 合并两个有序链表

## 21. 合并两个有序链表 (LeetCode 21)

### 题目
将两个升序链表合并为一个新的升序链表并返回。

### 解法
**迭代法**: 用哑节点简化操作，逐个比较两个链表的节点

### 时间/空间复杂度
- 时间: O(m+n)
- 空间: O(1)

### 代码
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def mergeTwoLists(l1, l2):
    dummy = ListNode(-1)
    current = dummy
    
    while l1 and l2:
        if l1.val <= l2.val:
            current.next = l1
            l1 = l1.next
        else:
            current.next = l2
            l2 = l2.next
        current = current.next
    
    # 连接剩余部分
    current.next = l1 if l1 else l2
    
    return dummy.next
```

### 测试用例
```python
def test_mergeTwoLists():
    # Test 1: 基本情况
    # l1: 1->2->4
    # l2: 1->3->4
    # Expected: 1->1->2->3->4->4
    l1 = ListNode(1, ListNode(2, ListNode(4)))
    l2 = ListNode(1, ListNode(3, ListNode(4)))
    result = mergeTwoLists(l1, l2)
    values = []
    while result:
        values.append(result.val)
        result = result.next
    assert values == [1, 1, 2, 3, 4, 4], f"Test1 failed: {values}"
    print("Test1 passed!")
    
    # Test 2: 一个为空
    l1 = ListNode(1, ListNode(2))
    l2 = None
    result = mergeTwoLists(l1, l2)
    values = []
    while result:
        values.append(result.val)
        result = result.next
    assert values == [1, 2], f"Test2 failed: {values}"
    print("Test2 passed!")
    
    # Test 3: 都为空
    result = mergeTwoLists(None, None)
    assert result is None, "Test3 failed"
    print("Test3 passed!")
    
    # Test 4: l1更短
    l1 = ListNode(2)
    l2 = ListNode(1, ListNode(3, ListNode(4)))
    result = mergeTwoLists(l1, l2)
    values = []
    while result:
        values.append(result.val)
        result = result.next
    assert values == [1, 2, 3, 4], f"Test4 failed: {values}"
    print("Test4 passed!")
    
    # Test 5: 相同元素
    l1 = ListNode(1, ListNode(1))
    l2 = ListNode(1, ListNode(1))
    result = mergeTwoLists(l1, l2)
    values = []
    while result:
        values.append(result.val)
        result = result.next
    assert values == [1, 1, 1, 1], f"Test5 failed: {values}"
    print("Test5 passed!")
    
    print("\n✅ All 5 tests passed!")

if __name__ == "__main__":
    test_mergeTwoLists()
