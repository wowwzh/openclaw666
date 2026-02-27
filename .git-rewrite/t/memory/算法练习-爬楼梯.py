"""
算法练习 - 爬楼梯 (LeetCode 70)
题目: 假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。
有多少种不同的方法可以爬到楼顶？
"""

def climbStairs(n):
    """动态规划解法 O(n) O(1)"""
    if n <= 2:
        return n
    
    # dp[i] = dp[i-1] + dp[i-2]
    prev2, prev1 = 1, 2  # dp[1]=1, dp[2]=2
    
    for i in range(3, n + 1):
        current = prev1 + prev2
        prev2 = prev1
        prev1 = current
    
    return prev1


def climbStairs_memo(n, memo={}):
    """递归 + 记忆化 O(n) O(n)"""
    if n in memo:
        return memo[n]
    if n <= 2:
        return n
    memo[n] = climbStairs_memo(n - 1, memo) + climbStairs_memo(n - 2, memo)
    return memo[n]


# 测试用例
test_cases = [
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 5),
    (5, 8),
    (10, 89),
    (20, 10946),
    (30, 1346269),
]

print("Algorithm Practice - Climbing Stairs (LeetCode 70)")

all_passed = True
for n, expected in test_cases:
    result = climbStairs(n)
    status = "PASS" if result == expected else "FAIL"
    if result != expected:
        all_passed = False
    print(f"n={n:2d}: result={result:8d}, expected={expected:8d} {status}")

print("=" * 40)
if all_passed:
    print("All tests passed!")
else:
    print("Some tests failed!")
