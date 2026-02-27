# 罗马数字转整数 (LeetCode 13)
# 解法: 哈希表 + 贪心
# 时间复杂度: O(n)
# 空间复杂度: O(1)

def romanToInt(s):
    mapping = {
        'I': 1, 'V': 5, 'X': 10, 'L': 50,
        'C': 100, 'D': 500, 'M': 1000
    }
    
    result = 0
    n = len(s)
    
    for i in range(n):
        # 如果当前字符比下一个大，加当前值
        # 如果当前字符比下一个小，减当前值（如 IV = 5-1 = 4）
        if i < n - 1 and mapping[s[i]] < mapping[s[i+1]]:
            result -= mapping[s[i]]
        else:
            result += mapping[s[i]]
    
    return result


# 测试用例
tests = [
    ('III', 3),
    ('IV', 4),
    ('IX', 9),
    ('LVIII', 58),
    ('MCMXCIV', 1994),
    ('I', 1)
]

print('=== 罗马数字转整数测试 ===')
all_passed = True
for s, expected in tests:
    result = romanToInt(s)
    status = 'PASS' if result == expected else 'FAIL'
    if result != expected:
        all_passed = False
    print(f'[{status}] {s} -> {result} (expect: {expected})')

print(f'\nResult: {"All Passed!" if all_passed else "Some Failed!"}')
