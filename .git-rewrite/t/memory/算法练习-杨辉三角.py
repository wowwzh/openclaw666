# 算法练习 - 杨辉三角

## LeetCode 118 - 杨辉三角

### 题目
给定行数 numRows，生成杨辉三角的前 numRows 行

### 解法
数学归纳法 - 每行首尾为1，其他数为上一行两数之和

### 时间复杂度
O(n²)

### 空间复杂度
O(n²)

### 代码
```python
def generate(numRows):
    if numRows == 0:
        return []
    
    triangle = [[1]]
    
    for i in range(1, numRows):
        prev = triangle[i-1]
        row = [1]  # 首元素
        
        for j in range(1, i):
            row.append(prev[j-1] + prev[j])
        
        row.append(1)  # 尾元素
        triangle.append(row)
    
    return triangle

# 测试
if __name__ == "__main__":
    # 测试1: numRows = 5
    result = generate(5)
    expected = [
        [1],
        [1, 1],
        [1, 2, 1],
        [1, 3, 3, 1],
        [1, 4, 6, 4, 1]
    ]
    print(f"测试1: {result == expected}")
    print(f"结果: {result}")
    
    # 测试2: numRows = 1
    result2 = generate(1)
    print(f"测试2: {result2 == [[1]]}")
    print(f"结果: {result2}")
    
    # 测试3: numRows = 0
    result3 = generate(0)
    print(f"测试3: {result3 == []}")
    print(f"结果: {result3}")
```

### 测试结果
✅ 全部通过
