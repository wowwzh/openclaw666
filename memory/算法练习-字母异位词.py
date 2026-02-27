# 算法练习：有效的字母异位词 (LeetCode 242)

## 题目
给定两个字符串 s 和 t ，编写一个函数来判断 t 是否是 s 的字母异位词。
（字母异位词指字母相同，但排列不同的字符串）

## 解法: 排序法 + 计数法

### 方法1: 排序比较 O(n log n)
```python
def isAnagram(s, t):
    return sorted(s) == sorted(t)
```

### 方法2: 字符计数 O(n) - 更优
```python
def isAnagram(s, t):
    if len(s) != len(t):
        return False
    
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for c in t:
        count[c] = count.get(c, 0) - 1
        if count[c] < 0:
            return False
    return True
```

### 方法3: 使用Counter (Pythonic)
```python
from collections import Counter
def isAnagram(s, t):
    return Counter(s) == Counter(t)
```

## 测试用例
test_cases = [
    ("anagram", "nagaram", True),
    ("rat", "car", False),
    ("listen", "silent", True),
    ("hello", "world", False),
    ("", "", True),
]

## 执行测试
if __name__ == "__main__":
    print("=" * 50)
    print("有效的字母异位词 - 测试")
    print("=" * 50)
    
    for s, t, expected in test_cases:
        result = isAnagram(s, t)
        status = "✅" if result == expected else "❌"
        print(f"{status} isAnagram('{s}', '{t}') = {result}, 预期: {expected}")
    
    print("\n" + "=" * 50)
    print("测试完成!")
    print("=" * 50)
