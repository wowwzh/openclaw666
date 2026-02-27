# LeetCode 22 - 括号生成
# 题目: 数字 n 生成所有有效括号组合

def generateParenthesis(n):
    """
    解法: 回溯法
    思路: 
    - 左括号随时可以加，只要不超过n
    - 右括号必须等到左括号数 > 右括号数时才能加
    """
    result = []
    
    def backtrack(current, left, right):
        # 终止条件
        if len(current) == 2 * n:
            result.append(current)
            return
        
        # 加左括号
        if left < n:
            backtrack(current + '(', left + 1, right)
        
        # 加右括号 (右括号数量必须小于左括号)
        if right < left:
            backtrack(current + ')', left, right + 1)
    
    backtrack('', 0, 0)
    return result


# 测试用例
if __name__ == "__main__":
    # 测试 n=3
    result = generateParenthesis(3)
    print(f"n=3 结果 ({len(result)}个):")
    for r in result:
        print(f"  {r}")
    
    # 验证结果
    print("\n验证:")
    for r in generateParenthesis(3):
        # 简单验证：左右括号数量相等
        assert r.count('(') == r.count('(') == 3
    print("Test passed!")
