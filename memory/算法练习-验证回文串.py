#!/usr/bin/env python3
"""
算法练习 - 验证回文串 (LeetCode 125)
题目: 判断字符串是否是回文（忽略非字母数字字符，大小写不敏感）
解法: 双指针 + 字符过滤
时间复杂度: O(n)
空间复杂度: O(1)
"""

def isPalindrome(s: str) -> bool:
    """验证字符串是否为回文串"""
    # 双指针从两端向中间逼近
    left, right = 0, len(s) - 1
    
    while left < right:
        # 跳过非字母数字字符
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        
        if left < right:
            # 比较（忽略大小写）
            if s[left].lower() != s[right].lower():
                return False
            left += 1
            right -= 1
    
    return True


# 测试用例
def test_isPalindrome():
    test_cases = [
        ("A man, a plan, a canal: Panama", True),     # 经典回文
        ("race a car", False),                          # 不是回文
        (" ", True),                                     # 空字符串
        ("a", True),                                     # 单字符
        ("0P", False),                                   # 数字+字母
        ("Was it a car or a cat I saw?", True),         # 含空格和标点
        ("hello", False),                               # 普通单词
        ("Madam, I'm Adam", True),                      # 经典名言
    ]
    
    print("=" * 50)
    print("Palindrome String - Test Results")
    print("=" * 50)
    
    passed = 0
    for s, expected in test_cases:
        result = isPalindrome(s)
        status = "[PASS]" if result == expected else "[FAIL]"
        print(f"{status} Input: \"{s[:30]}...\" " if len(s) > 30 else f"{status} Input: \"{s}\"")
        print(f"   Expected: {expected}, Actual: {result}")
        if result == expected:
            passed += 1
    
    print("=" * 50)
    print(f"Results: {passed}/{len(test_cases)} Passed")
    return passed == len(test_cases)


if __name__ == "__main__":
    test_isPalindrome()
