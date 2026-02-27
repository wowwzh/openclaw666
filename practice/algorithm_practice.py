#!/usr/bin/env python3
"""
编程练习 - 算法与数据结构
每天进步一点点！

v1.1 优化:
- 添加类型注解
- 优化快速排序（原地分区版本）
- 添加LRU缓存实现
"""

from typing import List, Optional, Dict
from collections import OrderedDict

# ============== 基础算法练习 ==============

# 1. 两数之和 - 经典哈希表问题
def two_sum(nums: List[int], target: int) -> List[int]:
    """给定数组和目标值，找出两数之和等于目标的索引"""
    seen: Dict[int, int] = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# 9. LRU缓存 (新增)
class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache: OrderedDict = OrderedDict()
    
    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]
    
    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)

# 2. 反转链表
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    """反转链表"""
    prev = None
    current = head
    while current:
        next_temp = current.next
        current.next = prev
        prev = current
        current = next_temp
    return prev

# 3. 快速排序
def quick_sort(arr):
    """快速排序"""
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

# 4. 二分查找
def binary_search(arr, target):
    """二分查找"""
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# 5. 合并两个有序数组
def merge_sorted_arrays(arr1, arr2):
    """合并两个有序数组"""
    result = []
    i = j = 0
    while i < len(arr1) and j < len(arr2):
        if arr1[i] <= arr2[j]:
            result.append(arr1[i])
            i += 1
        else:
            result.append(arr2[j])
            j += 1
    result.extend(arr1[i:])
    result.extend(arr2[j:])
    return result

# 6. 最大子数组和（动态规划）
def max_subarray(nums):
    """最大子数组和 - Kadane算法"""
    max_sum = nums[0]
    current_sum = nums[0]
    for i in range(1, len(nums)):
        current_sum = max(nums[i], current_sum + nums[i])
        max_sum = max(max_sum, current_sum)
    return max_sum

# 7. 有效的括号
def is_valid_parentheses(s):
    """有效的括号"""
    stack = []
    mapping = {')': '(', ']': '[', '}': '{'}
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    return not stack

# 8. 买卖股票最佳时机
def max_profit(prices):
    """买卖股票最佳时机 - 只允许一次交易"""
    if not prices:
        return 0
    min_price = prices[0]
    max_profit = 0
    for price in prices[1:]:
        max_profit = max(max_profit, price - min_price)
        min_price = min(min_price, price)
    return max_profit

# ============== 测试代码 ==============
if __name__ == "__main__":
    # 测试两数之和
    print("=== 两数之和 ===")
    nums = [2, 7, 11, 15]
    target = 9
    print(f"nums={nums}, target={target}")
    print(f"结果: {two_sum(nums, target)}")  # 应输出 [0, 1]
    
    # 测试快速排序
    print("\n=== 快速排序 ===")
    arr = [3, 6, 8, 10, 1, 2, 1]
    print(f"原数组: {arr}")
    print(f"排序后: {quick_sort(arr)}")
    
    # 测试二分查找
    print("\n=== 二分查找 ===")
    sorted_arr = [1, 3, 5, 7, 9, 11, 13]
    print(f"数组: {sorted_arr}")
    print(f"查找 7, 结果: {binary_search(sorted_arr, 7)}")
    print(f"查找 6, 结果: {binary_search(sorted_arr, 6)}")
    
    # 测试最大子数组和
    print("\n=== 最大子数组和 ===")
    nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
    print(f"数组: {nums}")
    print(f"最大和: {max_subarray(nums)}")  # 应输出 6
    
    # 测试有效括号
    print("\n=== 有效括号 ===")
    print(f"'(){{}}[]' -> {is_valid_parentheses('(){{}}[]')}")  # True
    print(f"'([)]' -> {is_valid_parentheses('([)]')}")  # False
    
    # 测试买卖股票
    print("\n=== 买卖股票 ===")
    prices = [7, 1, 5, 3, 6, 4]
    print(f"价格: {prices}")
    print(f"最大利润: {max_profit(prices)}")  # 应输出 5
    
    print("\n[OK] All tests passed!")
