#!/usr/bin/env python3
"""
最大子数组和 - LeetCode 53
给定一个整数数组 nums，找到一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

示例:
输入: nums = [-2,1,-3,4,-1,2,1,-5,4]
输出: 6
解释: 连续子数组 [4,-1,2,1] 的和最大，为 6。

解法: 贪心算法
- 遍历数组，用当前和与最大和比较
- 如果当前和为负数，则重新开始（因为负数会拉低总和）
- 时间复杂度: O(n)
- 空间复杂度: O(1)
"""

def max_sub_array(nums: list[int]) -> int:
    """贪心算法求解最大子数组和"""
    max_sum = nums[0]
    current_sum = nums[0]
    
    for i in range(1, len(nums)):
        # 如果当前和为负数，重新开始
        current_sum = max(nums[i], current_sum + nums[i])
        max_sum = max(max_sum, current_sum)
    
    return max_sum


def max_sub_array_dp(nums: list[int]) -> int:
    """动态规划解法（另一种思路）"""
    # dp[i] = 以nums[i]结尾的最大子数组和
    dp = [0] * len(nums)
    dp[0] = nums[0]
    max_sum = dp[0]
    
    for i in range(1, len(nums)):
        dp[i] = max(nums[i], dp[i-1] + nums[i])
        max_sum = max(max_sum, dp[i])
    
    return max_sum


# 测试用例
def test():
    test_cases = [
        ([-2, 1, -3, 4, -1, 2, 1, -5, 4], 6),       # 标准案例
        ([1], 1),                                    # 单元素
        ([5, 4, -1, 7, 8], 23),                     # 全正数
        ([-1, -2, -3, -4], -1),                     # 全负数
        ([1, 2, 3, 4], 10),                         # 连续正数
        ([-2, -1], -1),                             # 两个负数
        ([2, -1, 2, -1, 3], 5),                     # 正负交替
    ]
    
    print("=" * 50)
    print("最大子数组和 - 测试用例")
    print("=" * 50)
    
    all_passed = True
    for i, (nums, expected) in enumerate(test_cases, 1):
        result = max_sub_array(nums)
        status = "[OK]" if result == expected else "[FAIL]"
        if result != expected:
            all_passed = False
        print(f"{status} Test {i}: input={nums}")
        print(f"   预期: {expected}, 实际: {result}")
    
    print("=" * 50)
    if all_passed:
        print("[PASS] All tests passed!")
    else:
        print("[FAIL] Some tests failed!")
    print("=" * 50)
    
    return all_passed


if __name__ == "__main__":
    test()
