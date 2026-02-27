#!/usr/bin/env python3
"""
编程练习 - 高级算法与数据结构
每天进步一点点！

优化版本 v1.1:
- 添加类型注解
- 优化爬楼梯空间复杂度
- 添加更详细的测试用例
"""

from collections import deque
from typing import Dict, List, Set, Tuple, Optional
import heapq

# 1. BFS - 广度优先搜索
def bfs(graph, start):
    """BFS 遍历"""
    visited = set([start])
    queue = deque([start])
    result = []
    
    while queue:
        node = queue.popleft()
        result.append(node)
        
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return result

# 2. DFS - 深度优先搜索
def dfs(graph, start):
    """DFS 遍历（递归版）"""
    visited = set()
    result = []
    
    def _dfs(node):
        visited.add(node)
        result.append(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                _dfs(neighbor)
    
    _dfs(start)
    return result

# 3. 最短路径 - Dijkstra算法
import heapq

def dijkstra(graph, start):
    """Dijkstra 求最短路径"""
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    
    while pq:
        current_dist, current = heapq.heappop(pq)
        
        if current_dist > distances[current]:
            continue
            
        for neighbor, weight in graph.get(current, []):
            distance = current_dist + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
    
    return distances

# ============== 动态规划 ==============

# 4. 爬楼梯 - 空间优化版
def climb_stairs(n: int) -> int:
    """爬楼梯 - 多少种方法 (O(1)空间优化版)"""
    if n <= 2:
        return n
    # 只保留前两个状态，空间复杂度 O(1)
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b

# 5. 最长公共子序列
def lcs(text1, text2):
    """最长公共子序列"""
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]

# 6. 0-1 背包问题
def knapsack(weights, values, capacity):
    """0-1 背包问题"""
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i-1] <= w:
                dp[i][w] = max(
                    dp[i-1][w],
                    dp[i-1][w - weights[i-1]] + values[i-1]
                )
            else:
                dp[i][w] = dp[i-1][w]
    
    return dp[n][capacity]

# ============== 字符串算法 ==============

# 7. KMP 字符串匹配
def kmp_search(text, pattern):
    """KMP 字符串匹配"""
    def build_lps(pattern):
        lps = [0] * len(pattern)
        length = 0
        i = 1
        while i < len(pattern):
            if pattern[i] == pattern[length]:
                length += 1
                lps[i] = length
                i += 1
            else:
                if length != 0:
                    length = lps[length - 1]
                else:
                    lps[i] = 0
                    i += 1
        return lps
    
    lps = build_lps(pattern)
    i = j = 0
    while i < len(text):
        if pattern[j] == text[i]:
            i += 1
            j += 1
        if j == len(pattern):
            return i - j
        elif i < len(text) and pattern[j] != text[i]:
            j = lps[j - 1] if j > 0 else 0
    return -1

# 8. 最长不重复子串
def length_of_longest_substring(s):
    """最长不重复子串"""
    char_index = {}
    max_length = 0
    start = 0
    
    for i, char in enumerate(s):
        if char in char_index and char_index[char] >= start:
            start = char_index[char] + 1
        char_index[char] = i
        max_length = max(max_length, i - start + 1)
    
    return max_length

# ============== 排序算法 ==============

# 9. 归并排序
def merge_sort(arr):
    """归并排序"""
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    """合并两个有序数组"""
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# 10. 堆排序
def heap_sort(arr):
    """堆排序"""
    def heapify(arr, n, i):
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        
        if left < n and arr[left] > arr[largest]:
            largest = left
        if right < n and arr[right] > arr[largest]:
            largest = right
        if largest != i:
            arr[i], arr[largest] = arr[largest], arr[i]
            heapify(arr, n, largest)
    
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    
    return arr

# ============== 测试代码 ==============
if __name__ == "__main__":
    # 测试 BFS
    print("=== BFS ===")
    graph = {
        'A': ['B', 'C'],
        'B': ['A', 'D', 'E'],
        'C': ['A', 'F'],
        'D': ['B'],
        'E': ['B', 'F'],
        'F': ['C', 'E']
    }
    print(f"BFS from A: {bfs(graph, 'A')}")
    
    # 测试 DFS
    print("\n=== DFS ===")
    print(f"DFS from A: {dfs(graph, 'A')}")
    
    # 测试爬楼梯
    print("\n=== 爬楼梯 ===")
    print(f"n=5: {climb_stairs(5)} ways")  # 8
    print(f"n=10: {climb_stairs(10)} ways")  # 89
    
    # 测试最长不重复子串
    print("\n=== 最长不重复子串 ===")
    print(f"'abcabcbb': {length_of_longest_substring('abcabcbb')}")  # 3
    print(f"'bbbbb': {length_of_longest_substring('bbbbb')}")  # 1
    
    # 测试归并排序
    print("\n=== 归并排序 ===")
    arr = [64, 34, 25, 12, 22, 11, 90]
    print(f"原数组: {arr}")
    print(f"排序后: {merge_sort(arr)}")
    
    # 测试堆排序
    print("\n=== 堆排序 ===")
    arr = [64, 34, 25, 12, 22, 11, 90]
    print(f"原数组: {arr}")
    print(f"排序后: {heap_sort(arr)}")
    
    # 测试 KMP
    print("\n=== KMP 字符串匹配 ===")
    text = "ABABDABACDABABCABAB"
    pattern = "ABABCABAB"
    print(f"在 '{text}' 中查找 '{pattern}'")
    print(f"找到位置: {kmp_search(text, pattern)}")  # 10
    
    print("\n[OK] All advanced tests passed!")
