"""
JSON Validator Tool - 验证JSON格式并提取错误信息
"""

import json
import re

def validate_json(json_string):
    """验证JSON字符串，返回(是否有效, 错误信息)"""
    try:
        json.loads(json_string)
        return True, None
    except json.JSONDecodeError as e:
        return False, {
            "msg": e.msg,
            "pos": e.pos,
            "lineno": e.lineno,
            "colno": e.colno
        }

def format_json(json_string, indent=2):
    """格式化JSON字符串"""
    obj = json.loads(json_string)
    return json.dumps(obj, indent=indent, ensure_ascii=False)

def minify_json(json_string):
    """压缩JSON字符串"""
    obj = json.loads(json_string)
    return json.dumps(obj, separators=(',', ':'))

# Test cases
test_cases = [
    ('{"name": "Alice", "age": 25}', True, "Valid JSON"),
    ('{"name": "Bob", "skills": ["Python", "Java"]}', True, "Valid with array"),
    ('{"name": "Charlie", "age": null}', True, "Valid with null"),
    ('{"name": "David", "active": true}', True, "Valid with boolean"),
    ('{"name": "Eve", "data": {"key": "value"}}', True, "Valid nested"),
    ('{"name": "Frank", age: 30}', False, "Missing quotes"),
    ('{"name": "Grace", "age": }', False, "Missing value"),
    ('{"name": "Henry"', False, "Unclosed brace"),
    ('not json', False, "Not JSON at all"),
    ('[1, 2, 3]', True, "Valid JSON array"),
]

print("=" * 60)
print("JSON Validator Test Results")
print("=" * 60)

passed = 0
for json_str, expected_valid, desc in test_cases:
    is_valid, error = validate_json(json_str)
    status = "PASS" if is_valid == expected_valid else "FAIL"
    if is_valid == expected_valid:
        passed += 1
    print(f"{status} {desc}")
    print(f"  Input: {json_str[:50]}...")
    if not is_valid and error:
        print(f"  Error: {error['msg']} at line {error['lineno']}, col {error['colno']}")
    print()

print(f"Results: {passed}/{len(test_cases)} passed")

# Demo format/minify
print("\n--- Format Demo ---")
demo = '{"name":"Alice","age":25,"city":"Beijing"}'
print(f"Original: {demo}")
print(f"Formatted:\n{format_json(demo)}")
print(f"Minified: {minify_json(demo)}")
