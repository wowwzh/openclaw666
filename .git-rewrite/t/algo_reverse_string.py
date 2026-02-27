# Reverse String - LeetCode 344
# Solution: Two-pointer swap O(n)

def reverseString(s):
    """In-place string reversal"""
    left, right = 0, len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1
    return s


# Test cases
tests = [
    (['h','e','l','l','o'], ['o','l','l','e','h']),
    (['H','a','n','n','a','h'], ['h','a','n','n','a','H']),
    (['a'], ['a']),
    (['a','b'], ['b','a']),
    (['1','2','3','4','5'], ['5','4','3','2','1']),
]

print("=== Algorithm: Reverse String ===\n")
all_pass = True
for i, (input_arr, expected) in enumerate(tests):
    s = input_arr[:]
    result = reverseString(s)
    status = 'PASS' if result == expected else 'FAIL'
    if result != expected:
        all_pass = False
        print(f'{status} Test {i+1}: input={input_arr}, expected={expected}, got={result}')
    else:
        print(f'{status} Test {i+1}: {input_arr} -> {result}')

passed = sum(1 for t in tests if reverseString(t[0][:]) == t[1])
print(f'\nTotal: {len(tests)} tests, passed {passed}/{len(tests)}')
