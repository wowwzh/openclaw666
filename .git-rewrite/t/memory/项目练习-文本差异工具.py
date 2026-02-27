#!/usr/bin/env python3
"""
文本差异比较工具 v1.0
比较两个文本文件的差异，高亮显示
"""

import difflib
from datetime import datetime

def read_file(filepath):
    """读取文件，返回行列表"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.readlines()
    except FileNotFoundError:
        print(f"❌ 文件不存在: {filepath}")
        return []
    except Exception as e:
        print(f"❌ 读取失败: {e}")
        return []

def compare_files(file1, file2, output_file=None):
    """比较两个文件并输出差异"""
    lines1 = read_file(file1)
    lines2 = read_file(file2)
    
    if not lines1 and not lines2:
        return
    
    # 使用difflib生成差异
    diff = list(difflib.unified_diff(
        lines1, lines2,
        fromfile=file1,
        tofile=file2,
        lineterm=''
    ))
    
    if not diff:
        print("✅ 两个文件完全相同")
        return
    
    # 解析差异统计
    added = sum(1 for line in diff if line.startswith('+') and not line.startswith('+++'))
    removed = sum(1 for line in diff if line.startswith('-') and not line.startswith('---'))
    
    print(f"\n📊 差异统计:")
    print(f"   ➕ 新增: {added} 行")
    print(f"   ➖ 删除: {removed} 行")
    
    # 打印差异
    print(f"\n📝 差异详情:")
    for line in diff:
        if line.startswith('+++') or line.startswith('---'):
            continue
        elif line.startswith('+'):
            print(f"   🟢 {line}")
        elif line.startswith('-'):
            print(f"   🔴 {line}")
        else:
            print(f"   {line}")
    
    # 保存到文件
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(diff))
        print(f"\n💾 差异已保存到: {output_file}")

def compare_strings(str1, str2):
    """比较两个字符串"""
    lines1 = str1.splitlines(keepends=True)
    lines2 = str2.splitlines(keepends=True)
    
    diff = list(difflib.unified_diff(
        lines1, lines2,
        fromfile='文本1',
        tofile='文本2',
        lineterm=''
    ))
    
    return ''.join(diff)

# 测试
if __name__ == "__main__":
    # 测试用例
    text1 = """def hello():
    print("Hello")
    return True"""

    text2 = """def hello():
    print("Hello World")
    return False
    print("End")"""

    diff_result = compare_strings(text1, text2)
    print("=== 字符串差异测试 ===")
    print(diff_result)
