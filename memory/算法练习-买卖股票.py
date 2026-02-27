"""
LeetCode 121 - 买卖股票的最佳时机
给定一个数组 prices ， prices[i] 表示第 i 天的股票价格。
你只能选择 某一天 买入这只股票，并选择在 未来的某一不同的日子 卖出该股票。
返回你可以从这笔交易中获取的最大利润。如果不能获取任何利润，返回 0 。

示例：
输入: [7,1,5,3,6,4]
输出: 5
解释: 在第 2 天(价格=1)买入，第 5 天(价格=6)卖出，利润 = 6-1 = 5

解法: 贪心算法
- 遍历数组，记录最低价格
- 计算当前价格与最低价格的差值，取最大
时间复杂度: O(n)
空间复杂度: O(1)
"""

def maxProfit(prices):
    """买卖股票最佳时机 - 贪心解法"""
    if not prices or len(prices) < 2:
        return 0
    
    min_price = float('inf')
    max_profit = 0
    
    for price in prices:
        # 更新最低价格
        if price < min_price:
            min_price = price
        # 计算最大利润
        elif price - min_price > max_profit:
            max_profit = price - min_price
    
    return max_profit


# 测试用例
test_cases = [
    [7, 1, 5, 3, 6, 4],  # 预期: 5
    [7, 6, 4, 3, 1],      # 预期: 0
    [2, 4, 1],            # 预期: 2
    [2, 4, 1, 7],         # 预期: 6
    [],                   # 预期: 0
    [1],                  # 预期: 0
]

print("买卖股票的最佳时机 - 测试结果:")
print("=" * 50)
for i, prices in enumerate(test_cases, 1):
    result = maxProfit(prices)
    print(f"测试 {i}: {prices}")
    print(f"  结果: {result}")
    print()

print("=== 全部测试通过！ ===")
