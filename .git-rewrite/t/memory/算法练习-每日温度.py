"""
每日温度 (LeetCode 739)
给定温度数组，返回每一天需要等多少天才能等到更暖和的温度
"""
from typing import List

def dailyTemperatures(temperatures: List[int]) -> List[int]:
    """
    解法: 单调栈（存储下标）
    时间复杂度: O(n)
    空间复杂度: O(n)
    """
    n = len(temperatures)
    answer = [0] * n
    stack = []  # 存储下标，温度单调递增
    
    for i in range(n):
        # 当前温度比栈顶温度高，说明找到了更暖和的一天
        while stack and temperatures[i] > temperatures[stack[-1]]:
            prev_index = stack.pop()
            answer[prev_index] = i - prev_index
        
        stack.append(i)
    
    return answer


# 测试用例
def test():
    # 测试1
    temps1 = [73, 74, 75, 71, 69, 72, 76, 73]
    result1 = dailyTemperatures(temps1)
    expected1 = [1, 1, 4, 2, 1, 1, 0, 0]
    print(f"测试1: {result1}")
    assert result1 == expected1, f"期望 {expected1}"
    print("[PASS] Test 1 passed")
    
    # 测试2
    temps2 = [30, 40, 50, 60]
    result2 = dailyTemperatures(temps2)
    expected2 = [1, 1, 1, 0]
    print(f"测试2: {result2}")
    assert result2 == expected2, f"期望 {expected2}"
    print("[PASS] Test 2 passed")
    
    # 测试3
    temps3 = [30, 30, 30, 30]
    result3 = dailyTemperatures(temps3)
    expected3 = [0, 0, 0, 0]
    print(f"测试3: {result3}")
    assert result3 == expected3, f"期望 {expected3}"
    print("[PASS] Test 3 passed")
    
    # 测试4: 递减温度
    temps4 = [80, 70, 60, 50, 40]
    result4 = dailyTemperatures(temps4)
    expected4 = [0, 0, 0, 0, 0]
    print(f"测试4: {result4}")
    assert result4 == expected4, f"期望 {expected4}"
    print("[PASS] Test 4 passed")
    
    print("\n[SUCCESS] All tests passed!")


if __name__ == "__main__":
    test()
