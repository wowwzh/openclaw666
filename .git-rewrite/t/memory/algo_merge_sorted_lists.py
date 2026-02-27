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
    
    # Connect remaining part
    current.next = l1 if l1 else l2
    
    return dummy.next


# Test Cases
def test_mergeTwoLists():
    # Test 1: Basic case
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
    
    # Test 2: One is None
    l1 = ListNode(1, ListNode(2))
    l2 = None
    result = mergeTwoLists(l1, l2)
    values = []
    while result:
        values.append(result.val)
        result = result.next
    assert values == [1, 2], f"Test2 failed: {values}"
    print("Test2 passed!")
    
    # Test 3: Both are None
    result = mergeTwoLists(None, None)
    assert result is None, "Test3 failed"
    print("Test3 passed!")
    
    # Test 4: l1 is shorter
    l1 = ListNode(2)
    l2 = ListNode(1, ListNode(3, ListNode(4)))
    result = mergeTwoLists(l1, l2)
    values = []
    while result:
        values.append(result.val)
        result = result.next
    assert values == [1, 2, 3, 4], f"Test4 failed: {values}"
    print("Test4 passed!")
    
    # Test 5: Same elements
    l1 = ListNode(1, ListNode(1))
    l2 = ListNode(1, ListNode(1))
    result = mergeTwoLists(l1, l2)
    values = []
    while result:
        values.append(result.val)
        result = result.next
    assert values == [1, 1, 1, 1], f"Test5 failed: {values}"
    print("Test5 passed!")
    
    print("\nAll 5 tests passed!")

if __name__ == "__main__":
    test_mergeTwoLists()
