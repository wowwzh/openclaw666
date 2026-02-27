"""
两数之和 (LeetCode 1)
给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的两个整数，并返回它们的数组下标。

解法: 哈希表 O(n) - 一遍遍历
"""

def two_sum(nums, target):
    """使用哈希表找到两数之和"""
    seen = {}  # num -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# 测试用例
test_cases = [
    ([2, 7, 11, 15], 9, [0, 1]),
    ([3, 2, 4], 6, [1, 2]),
    ([3, 3], 6, [0, 1]),
    ([-1, -2, -3, -4, -5], -8, [2, 4]),
    ([], 0, []),  # 空数组
]

print("=== 两数之和 测试 ===")
for nums, target, expected in test_cases:
    result = two_sum(nums, target)
    print("[PASS]" if (result == expected or (result and nums[result[0]] + nums[result[1]] == target)) else "[FAIL]", end=" ")

print("\n复杂度: 时间O(n), 空间O(n)")
