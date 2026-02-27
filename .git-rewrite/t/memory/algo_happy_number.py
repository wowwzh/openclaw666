"""
快乐数算法
LeetCode 202: https://leetcode.com/problems/happy-number

定义n为快乐数:
- 反复替换为各位数字平方和
- 最终为1则是快乐数
- 否则进入无限循环
"""

def is_happy(n: int) -> bool:
    """判断是否为快乐数"""
    # 使用集合检测循环
    seen = set()
    
    while n != 1 and n not in seen:
        seen.add(n)
        n = sum(int(d) ** 2 for d in str(n))
    
    return n == 1


def is_happy_fast(n: int) -> bool:
    """快慢指针法 - 更优解"""
    def get_next(x):
        return sum(int(d) ** 2 for d in str(x))
    
    slow = n
    fast = get_next(n)
    
    while fast != 1 and slow != fast:
        slow = get_next(slow)
        fast = get_next(get_next(fast))
    
    return fast == 1


# 测试用例
test_cases = [
    (19, True),   # 经典例子
    (1, True),    # 1是快乐数
    (2, False),   # 不是快乐数
    (7, True),    # 7是快乐数
    (4, False),   # 4不是快乐数
    (16, False),  # 16不是
    (97, True),   # 97是快乐数
    (4, False),   # 4 -> 16 -> 37 -> 58 -> 89 -> 145 -> 42 -> 20 -> 4 (循环)
]

print("=== 快乐数测试 ===")
for n, expected in test_cases:
    result = is_happy(n)
    status = "PASS" if result == expected else "FAIL"
    print(f"[{status}] is_happy({n}) = {result} (expected: {expected})")

print("\n=== 快慢指针法测试 ===")
for n, expected in test_cases[:4]:
    result = is_happy_fast(n)
    status = "PASS" if result == expected else "FAIL"
    print(f"[{status}] is_happy_fast({n}) = {result} (expected: {expected})")

print("\n算法分析:")
print("- 时间复杂度: O(log n) - 数字位数有限")
print("- 空间复杂度: O(log n) / O(1) 快慢指针")
print("- 核心思路: 检测循环，快慢指针最优")
