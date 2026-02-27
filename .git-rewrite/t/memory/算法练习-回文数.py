"""
回文数 - LeetCode 9
判断一个整数是否是回文数

示例:
- 121 -> true
- -121 -> false (负数不是回文)
- 10 -> false (末尾有0但开头没有)
"""

def is_palindrome(x: int) -> bool:
    """解法: 转字符串法 O(n)"""
    if x < 0:
        return False
    s = str(x)
    return s == s[::-1]

def is_palindrome_math(x: int) -> bool:
    """解法: 数学法 O(log n) - 不转字符串"""
    if x < 0 or (x % 10 == 0 and x != 0):
        return False
    
    reverted = 0
    while x > reverted:
        reverted = reverted * 10 + x % 10
        x //= 10
    
    return x == reverted or x == reverted // 10

# 测试
test_cases = [
    (121, True),
    (-121, False),
    (10, False),
    (12321, True),
    (123, False),
    (0, True),
]

print("=== 回文数测试 ===")
for num, expected in test_cases:
    result = is_palindrome(num)
    status = "OK" if result == expected else "FAIL"
    print(f"{status} {num} -> {result} (expected: {expected})")

print("\n=== 数学法测试 ===")
for num, expected in test_cases:
    result = is_palindrome_math(num)
    status = "OK" if result == expected else "FAIL"
    print(f"{status} {num} -> {result} (expected: {expected})")
