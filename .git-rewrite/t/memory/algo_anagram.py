# Algorithm: Valid Anagram (LeetCode 242)

# Problem: Check if two strings are anagrams

# Solution: Character counting O(n)
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

# Alternative: Using Counter (Pythonic)
from collections import Counter

def isAnagram_counter(s, t):
    return Counter(s) == Counter(t)

# Test cases
test_cases = [
    ("anagram", "nagaram", True),
    ("rat", "car", False),
    ("listen", "silent", True),
    ("hello", "world", False),
    ("", "", True),
    ("abc", "cba", True),
    ("abc", "abd", False),
]

# Run tests
if __name__ == "__main__":
    print("=" * 50)
    print("Valid Anagram - Tests")
    print("=" * 50)
    
    for s, t, expected in test_cases:
        result = isAnagram(s, t)
        status = "PASS" if result == expected else "FAIL"
        print(f"{status} isAnagram('{s}', '{t}') = {result}, expected: {expected}")
    
    print("\n" + "=" * 50)
    print("All tests completed!")
    print("=" * 50)
