# LeetCode 234: Palindrome Linked List

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def isPalindrome(head):
    if not head or not head.next:
        return True
    
    # 1. Find middle
    slow = fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    
    # 2. Reverse second half
    prev = None
    current = slow.next
    while current:
        next_temp = current.next
        current.next = prev
        prev = current
        current = next_temp
    
    # 3. Compare
    left = head
    right = prev
    while right:
        if left.val != right.val:
            return False
        left = left.next
        right = right.next
    
    return True

def create_linked_list(lst):
    if not lst:
        return None
    head = ListNode(lst[0])
    current = head
    for val in lst[1:]:
        current.next = ListNode(val)
        current = current.next
    return head

# Test cases
test_cases = [
    ([1, 2, 2, 1], True),
    ([1, 2, 3, 2, 1], True),
    ([1, 2], False),
    ([1], True),
    ([], True),
]

print("Palindrome Linked List Tests:")
for nums, expected in test_cases:
    head = create_linked_list(nums)
    result = isPalindrome(head)
    status = "PASS" if result == expected else "FAIL"
    print(f"{status}: input={nums}, expected={expected}, result={result}")

print("\nTime: O(n), Space: O(1)")
