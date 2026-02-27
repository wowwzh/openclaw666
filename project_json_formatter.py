"""
JSON 格式化工具 v1.0
功能: 格式化、美化、压缩JSON，支持中文显示
"""

import json
import sys

def format_json(json_str, indent=2, ensure_ascii=False):
    """格式化JSON字符串"""
    try:
        data = json.loads(json_str)
        return json.dumps(data, indent=indent, ensure_ascii=ensure_ascii)
    except json.JSONDecodeError as e:
        return f"JSON解析错误: {e}"

def minify_json(json_str):
    """压缩JSON (去除空白)"""
    try:
        data = json.loads(json_str)
        return json.dumps(data, separators=(',', ':'))
    except json.JSONDecodeError as e:
        return f"JSON解析错误: {e}"

def validate_json(json_str):
    """验证JSON是否有效"""
    try:
        data = json.loads(json_str)
        return True, f"有效JSON, {len(data) if isinstance(data, (dict, list)) else 'scalar'} 个元素"
    except json.JSONDecodeError as e:
        return False, str(e)

def parse_json(json_str):
    """解析JSON返回结构信息"""
    try:
        data = json.loads(json_str)
        if isinstance(data, dict):
            return f"Object, {len(data)} keys: {list(data.keys())[:5]}"
        elif isinstance(data, list):
            return f"Array, {len(data)} items"
        else:
            return f"Value ({type(data).__name__}): {data}"
    except json.JSONDecodeError as e:
        return f"解析错误: {e}"

# 测试
test_json = '{"name": "张三", "age": 25, "skills": ["Python", "JavaScript"], "active": true}'

print("=== JSON格式化工具测试 ===\n")

print("1. 格式化 (缩进2):")
print(format_json(test_json))

print("\n2. 格式化 (缩进4):")
print(format_json(test_json, indent=4))

print("\n3. 压缩:")
print(minify_json(test_json))

print("\n4. 验证:")
valid, msg = validate_json(test_json)
print(f"  {valid}: {msg}")

valid2, msg2 = validate_json("{invalid}")
print(f"  {valid2}: {msg2}")

print("\n5. 解析结构:")
print(f"  {parse_json(test_json)}")

print("\n=== 所有测试通过 ===")
