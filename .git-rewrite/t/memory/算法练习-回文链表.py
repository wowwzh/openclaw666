# 算法练习 - 回文链表

## 题目
LeetCode 234: 判断链表是否为回文

## 解法
1. 找到链表中间节点
2. 反转后半部分链表
3. 比较前半部分和后半部分

## 代码
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def isPalindrome(head):
    if not head or not head.next:
        return True
    
    # 1. 找到中间节点
    slow = fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    
    # 2. 反转后半部分链表
    prev = None
    current = slow.next
    while current:
        next_temp = current.next
        current.next = prev
        prev = current
        current = next_temp
    
    # 3. 比较前后两部分
    left = head
    right = prev
    while right:
        if left.val != right.val:
            return False
        left = left.next
        right = right.next
    
    return True

# 测试
def create_linked_list(lst):
    if not lst:
        return None
    head = ListNode(lst[0])
    current = head
    for val in lst[1:]:
        current.next = ListNode(val)
        current = current.next
    return head

# 测试用例
test_cases = [
    ([1, 2, 2, 1], True),
    ([1, 2, 3, 2, 1], True),
    ([1, 2], False),
    ([1], True),
    ([], True),
]

print("回文链表测试:")
for nums, expected in test_cases:
    head = create_linked_list(nums)
    result = isPalindrome(head)
    status = "✅" if result == expected else "❌"
    print(f"{status} 输入: {nums}, 预期: {expected}, 结果: {result}")

print("\n时间复杂度: O(n)")
print("空间复杂度: O(1)")
