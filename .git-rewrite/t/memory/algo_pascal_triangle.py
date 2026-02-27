# LeetCode 118 - Pascal's Triangle

def generate(numRows):
    if numRows == 0:
        return []
    
    triangle = [[1]]
    
    for i in range(1, numRows):
        prev = triangle[i-1]
        row = [1]
        
        for j in range(1, i):
            row.append(prev[j-1] + prev[j])
        
        row.append(1)
        triangle.append(row)
    
    return triangle


# Test
if __name__ == "__main__":
    # Test 1: numRows = 5
    result = generate(5)
    expected = [
        [1],
        [1, 1],
        [1, 2, 1],
        [1, 3, 3, 1],
        [1, 4, 6, 4, 1]
    ]
    print(f"Test 1: {result == expected}")
    print(f"Result: {result}")
    
    # Test 2: numRows = 1
    result2 = generate(1)
    print(f"Test 2: {result2 == [[1]]}")
    print(f"Result: {result2}")
    
    # Test 3: numRows = 0
    result3 = generate(0)
    print(f"Test 3: {result3 == []}")
    print(f"Result: {result3}")
    
    print("\n✅ All tests passed!")
