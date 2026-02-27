# LeetCode 26 - Remove Duplicates from Sorted Array

def removeDuplicates(nums):
    if not nums:
        return 0
    
    slow = 0
    
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    
    return slow + 1

# Test cases
test_cases = [
    ([1,1,2], [1,2]),
    ([1,1,2,2,3], [1,2,3]),
    ([1,1,1], [1]),
    ([], []),
    ([1], [1]),
]

print("Test removeDuplicates:")
for nums, expected in test_cases:
    nums_copy = nums[:]
    length = removeDuplicates(nums_copy)
    result = nums_copy[:length]
    print(f"Input: {nums}, Length: {length}, Result: {result}, Expected: {expected}, Pass: {result == expected}")
