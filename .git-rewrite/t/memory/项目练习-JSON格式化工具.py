"""
JSON格式化工具 v1.0
功能: 格式化/压缩JSON，支持语法高亮、验证、路径查询
"""

import json
from typing import Any, Optional

class JsonFormatter:
    def __init__(self):
        self.indent = 2  # 默认缩进
    
    def format(self, json_str: str, indent: Optional[int] = None) -> str:
        """格式化JSON，添加缩进"""
        try:
            obj = json.loads(json_str)
            indent = indent or self.indent
            return json.dumps(obj, indent=indent, ensure_ascii=False)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {e}")
    
    def compress(self, json_str: str) -> str:
        """压缩JSON，去除空格"""
        try:
            obj = json.loads(json_str)
            return json.dumps(obj, separators=(',', ':'), ensure_ascii=False)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {e}")
    
    def validate(self, json_str: str) -> tuple[bool, Optional[str]]:
        """验证JSON是否有效"""
        try:
            json.loads(json_str)
            return True, None
        except json.JSONDecodeError as e:
            return False, str(e)
    
    def get_value(self, json_str: str, path: str) -> Any:
        """
        根据路径获取JSON中的值
        路径格式: key.subkey[0].field
        """
        try:
            obj = json.loads(json_str)
            keys = self._parse_path(path)
            
            current = obj
            for key in keys:
                if isinstance(key, int):
                    current = current[key]
                else:
                    current = current[key]
            return current
        except (json.JSONDecodeError, KeyError, IndexError, TypeError) as e:
            raise ValueError(f"Path error: {e}")
    
    def _parse_path(self, path: str) -> list:
        """解析路径字符串"""
        import re
        result = []
        parts = path.split('.')
        
        for part in parts:
            # 检查是否有数组索引
            match = re.match(r'(\w+)\[(\d+)\]', part)
            if match:
                result.append(match.group(1))
                result.append(int(match.group(2)))
            else:
                result.append(part)
        return result
    
    def diff(self, json1: str, json2: str) -> dict:
        """比较两个JSON的差异"""
        try:
            obj1 = json.loads(json1)
            obj2 = json.loads(json2)
            
            return self._deep_diff(obj1, obj2, "")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {e}")
    
    def _deep_diff(self, obj1: Any, obj2: Any, path: str) -> dict:
        """递归比较差异"""
        diff = {}
        
        if type(obj1) != type(obj2):
            diff[path] = f"{type(obj1).__name__} -> {type(obj2).__name__}"
            return diff
        
        if isinstance(obj1, dict):
            all_keys = set(obj1.keys()) | set(obj2.keys())
            for key in all_keys:
                new_path = f"{path}.{key}" if path else key
                if key not in obj1:
                    diff[new_path] = f"added: {obj2[key]}"
                elif key not in obj2:
                    diff[new_path] = f"removed: {obj1[key]}"
                else:
                    sub_diff = self._deep_diff(obj1[key], obj2[key], new_path)
                    diff.update(sub_diff)
        
        elif isinstance(obj1, list):
            if len(obj1) != len(obj2):
                diff[path] = f"length: {len(obj1)} -> {len(obj2)}"
            else:
                for i, (v1, v2) in enumerate(zip(obj1, obj2)):
                    sub_diff = self._deep_diff(v1, v2, f"{path}[{i}]")
                    diff.update(sub_diff)
        
        else:
            if obj1 != obj2:
                diff[path] = f"{obj1} -> {obj2}"
        
        return diff


# 测试
if __name__ == "__main__":
    formatter = JsonFormatter()
    
    # 测试数据
    test_json = '{"name": "张三", "age": 25, "skills": ["Python", "JS"], "info": {"city": "北京"}}'
    
    print("=== JSON Formatter Test ===")
    print("\n1. Format:")
    print(formatter.format(test_json))
    
    print("\n2. Compress:")
    print(formatter.compress(test_json))
    
    print("\n3. Validate:")
    valid, error = formatter.validate(test_json)
    print(f"Valid: {valid}")
    
    print("\n4. Get value by path:")
    print(f"name: {formatter.get_value(test_json, 'name')}")
    print(f"skills[0]: {formatter.get_value(test_json, 'skills[0]')}")
    print(f"info.city: {formatter.get_value(test_json, 'info.city')}")
    
    print("\n5. Diff:")
    json1 = '{"a": 1, "b": 2}'
    json2 = '{"a": 1, "b": 3, "c": 4}'
    print(formatter.diff(json1, json2))
