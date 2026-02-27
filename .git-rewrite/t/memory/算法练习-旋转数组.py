"""
旋转数组 (LeetCode 189)
给定一个整数数组 nums，将数组中的元素向右轮转 k 个位置

解法1: 环状替换 - O(n) 时间, O(1) 空间
解法2: 反转法 - O(n) 时间, O(1) 空间
解法3: 切片拼接 - O(n) 时间, O(n) 空间
"""

def rotate(nums: list[int], k: int) -> None:
    """解法2: 反转法"""
    n = len(nums)
    k = k % n  # 处理 k > n 的情况
    
    def reverse(l, r):
        while l < r:
            nums[l], nums[r] = nums[r], nums[l]
            l += 1
            r -= 1
    
    # 三次反转
    reverse(0, n - 1)      # 全部反转
    reverse(0, k - 1)      # 前k个反转
    reverse(k, n - 1)      # 后n-k个反转

# 测试
if __name__ == "__main__":
    # 测试用例
    test_cases = [
        ([1,2,3,4,5,6,7], 3, [5,6,7,1,2,3,4]),
        ([-1,-100,3,99], 2, [3,99,-1,-100]),
        ([1,2], 3, [2,1]),
    ]
    
    for i, (nums, k, expected) in enumerate(test_cases):
        original = nums.copy()
        rotate(nums, k)
        status = "PASS" if nums == expected else "FAIL"
        print(f"Test{i+1}: {status}")
        print(f"  Input: {original}, k={k}")
        print(f"  Expected: {expected}")
        print(f"  Result: {nums}")
