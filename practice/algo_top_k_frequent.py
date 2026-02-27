"""
Top K Frequent Elements - LeetCode 347
解题思路: 堆排序 / 快速选择 / 桶排序
时间复杂度: O(n log k)
空间复杂度: O(n)
"""

from typing import List
from collections import Counter
import heapq


def top_k_frequent_heap(nums: List[int], k: int) -> List[int]:
    """使用堆 - O(n log k)"""
    # 统计频率
    freq = Counter(nums)
    
    # 建立最小堆 (频率, 数字)
    # heapq是最小堆，所以用负频率
    heap = [(-count, num) for num, count in freq.items()]
    heapq.heapify(heap)
    
    # 取前k个
    result = []
    for _ in range(k):
        if heap:
            count, num = heapq.heappop(heap)
            result.append(num)
    
    return result


def top_k_frequent_bucket(nums: List[int], k: int) -> List[int]:
    """使用桶排序 - O(n)"""
    if not nums or k <= 0:
        return []
    
    # 统计频率
    freq = Counter(nums)
    n = len(nums)
    
    # 建立桶: bucket[i] 存储出现频率为i的数字
    buckets = [[] for _ in range(n + 1)]
    for num, count in freq.items():
        buckets[count].append(num)
    
    # 从高频桶收集结果
    result = []
    for i in range(n, 0, -1):
        result.extend(buckets[i])
        if len(result) >= k:
            break
    
    return result[:k]


def top_k_frequent_quickselect(nums: List[int], k: int) -> List[int]:
    """使用快速选择 - O(n) 简化版"""
    if not nums or k <= 0:
        return []
    
    # 统计频率
    freq = Counter(nums)
    
    # 按频率排序
    sorted_items = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    
    # 取前k个
    result = [num for num, _ in sorted_items[:k]]
    
    return result


def test_top_k():
    # 测试用例
    nums1 = [1, 1, 1, 2, 2, 3]
    k1 = 2
    expected1 = [1, 2]
    
    nums2 = [1]
    k2 = 1
    expected2 = [1]
    
    # 堆方法测试
    result1 = top_k_frequent_heap(nums1, k1)
    assert sorted(result1) == sorted(expected1), f"Heap test failed: {result1}"
    
    result2 = top_k_frequent_heap(nums2, k2)
    assert result2 == expected2, f"Heap test2 failed: {result2}"
    
    # 桶方法测试
    result3 = top_k_frequent_bucket(nums1, k1)
    assert sorted(result3) == sorted(expected1), f"Bucket test failed: {result3}"
    
    # 快速选择测试
    result4 = top_k_frequent_quickselect(nums1, k1)
    assert sorted(result4) == sorted(expected1), f"QuickSelect test failed: {result4}"
    
    print("All tests passed!")


if __name__ == "__main__":
    test_top_k()
    
    # 演示
    nums = [1, 1, 1, 2, 2, 3, 3, 3, 4, 4, 5]
    k = 3
    
    print(f"\nInput: {nums}, k={k}")
    print(f"Heap method:     {top_k_frequent_heap(nums, k)}")
    print(f"Bucket method:  {top_k_frequent_bucket(nums, k)}")
    print(f"QuickSelect:    {top_k_frequent_quickselect(nums, k)}")
