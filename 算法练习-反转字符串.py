# 反转字符串 LeetCode 344
# 解法: 双指针交换 O(n)

def reverseString(s):
    """原地反转字符串"""
    left, right = 0, len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1
    return s


# 测试用例
tests = [
    (['h','e','l','l','o'], ['o','l','l','e','h']),
    (['H','a','n','n','a','h'], ['h','a','n','n','a','H']),
    (['a'], ['a']),
    (['a','b'], ['b','a']),
    (['1','2','3','4','5'], ['5','4','3','2','1']),
]

print("=== 算法练习: 反转字符串 ===\n")
all_pass = True
for i, (input_arr, expected) in enumerate(tests):
    s = input_arr[:]
    result = reverseString(s)
    status = '✅' if result == expected else '❌'
    if result != expected:
        all_pass = False
        print(f'{status} Test {i+1}: 输入={input_arr}, 期望={expected}, 实际={result}')
    else:
        print(f'{status} Test {i+1}: {input_arr} -> {result}')

passed = sum(1 for t in tests if reverseString(t[0][:]) == t[1])
print(f'\n总计: {len(tests)} 测试, 通过 {passed}/{len(tests)}')
