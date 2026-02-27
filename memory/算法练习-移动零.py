"""
移动零 (LeetCode 283)
题目: 给定数组，将所有0移到末尾，保持非零元素相对顺序
解法: 双指针法 O(n)
"""

def moveZeroes(nums):
    """
    双指针: slow指向下一个非零元素应该放的位置
    """
    slow = 0
    for fast in range(len(nums)):
        if nums[fast] != 0:
            nums[slow], nums[fast] = nums[fast], nums[slow]
            slow += 1
    # 后面的自动都是0

# 测试
test_cases = [
    ([0,1,0,3,12], [1,3,12,0,0]),
    ([0], [0]),
    ([1], [1]),
    ([0,0,1], [1,0,0]),
    ([1,0,0,2,3], [1,2,3,0,0]),
]

print("=== 移动零测试 ===")
for i, (input_arr, expected) in enumerate(test_cases):
    nums = input_arr[:]
    moveZeroes(nums)
    status = "✅" if nums == expected else f"❌ 期望{expected}"
    print(f"测试{i+1}: {input_arr} → {nums} {status}")
