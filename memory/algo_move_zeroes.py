"""
Move Zeroes (LeetCode 283)
Given array, move all zeros to end while maintaining relative order of non-zero elements
Solution: Two-pointer O(n)
"""

def moveZeroes(nums):
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1

# Tests
test_cases = [
    ([0,1,0,3,12], [1,3,12,0,0]),
    ([0], [0]),
    ([1], [1]),
    ([0,0,1], [1,0,0]),
    ([1,0,0,2,3], [1,2,3,0,0]),
]

print("=== Move Zeroes Test ===")
for i, (input_arr, expected) in enumerate(test_cases):
    nums = input_arr[:]
    moveZeroes(nums)
    status = "PASS" if nums == expected else f"FAIL expected {expected}"
    print(f"Test {i+1}: {input_arr} -> {nums} {status}")
