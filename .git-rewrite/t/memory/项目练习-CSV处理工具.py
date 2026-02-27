#!/usr/bin/env python3
"""
项目练习 - CSV数据处理工具 v1.0
功能:
  - CSV文件读取/解析
  - 数据筛选（按条件过滤行）
  - 数据排序（多字段）
  - 数据统计（求和、平均值、最大最小值）
  - 导出为JSON
"""

import csv
import json
from typing import List, Dict, Any, Callable, Optional


class CSVProcessor:
    """CSV数据处理器"""
    
    def __init__(self, data: List[Dict[str, Any]] = None):
        self.data = data or []
        self.headers = []
    
    @classmethod
    def from_csv_file(cls, filepath: str) -> 'CSVProcessor':
        """从CSV文件加载数据"""
        processor = cls()
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            processor.headers = reader.fieldnames or []
            processor.data = list(reader)
        return processor
    
    @classmethod
    def from_csv_string(cls, csv_string: str) -> 'CSVProcessor':
        """从CSV字符串加载数据"""
        processor = cls()
        import io
        reader = csv.DictReader(io.StringIO(csv_string))
        processor.headers = reader.fieldnames or []
        processor.data = list(reader)
        return processor
    
    def filter(self, condition: Callable[[Dict], bool]) -> 'CSVProcessor':
        """按条件筛选数据"""
        filtered_data = [row for row in self.data if condition(row)]
        return CSVProcessor(filtered_data)
    
    def sort_by(self, field: str, reverse: bool = False) -> 'CSVProcessor':
        """按字段排序"""
        def get_value(row):
            val = row.get(field, '')
            # 尝试转为数字排序
            try:
                return float(val)
            except (ValueError, TypeError):
                return str(val)
        
        sorted_data = sorted(self.data, key=get_value, reverse=reverse)
        return CSVProcessor(sorted_data)
    
    def stats(self, field: str) -> Dict[str, float]:
        """统计字段数值"""
        values = []
        for row in self.data:
            try:
                values.append(float(row.get(field, 0)))
            except (ValueError, TypeError):
                continue
        
        if not values:
            return {}
        
        return {
            'count': len(values),
            'sum': sum(values),
            'avg': sum(values) / len(values),
            'min': min(values),
            'max': max(values)
        }
    
    def to_json(self, indent: int = 2) -> str:
        """导出为JSON"""
        return json.dumps(self.data, ensure_ascii=False, indent=indent)
    
    def to_csv_string(self) -> str:
        """导出为CSV字符串"""
        if not self.data:
            return ""
        
        import io
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=self.headers)
        writer.writeheader()
        writer.writerows(self.data)
        return output.getvalue()
    
    def head(self, n: int = 5) -> List[Dict]:
        """返回前n行数据"""
        return self.data[:n]
    
    def __len__(self):
        return len(self.data)


def test_csv_processor():
    """测试CSV处理器"""
    print("=" * 50)
    print("CSV Processor - Test Results")
    print("=" * 50)
    
    # 测试数据
    csv_data = """name,age,salary,department
Alice,28,8000,Engineering
Bob,35,12000,Marketing
Charlie,32,9500,Engineering
Diana,29,7500,Marketing
Eve,40,15000,Engineering"""
    
    # 1. 从字符串加载
    processor = CSVProcessor.from_csv_string(csv_data)
    print(f"[PASS] Load CSV: {len(processor)} rows loaded")
    
    # 2. 数据筛选 - 薪资 >= 8000 (>=8000才是4行)
    filtered = processor.filter(lambda r: float(r['salary']) >= 8000)
    assert len(filtered) == 4, f"Expected 4, got {len(filtered)}"
    print(f"[PASS] Filter salary > 8000: {len(filtered)} rows")
    
    # 3. 数据排序 - 按年龄升序
    sorted_by_age = processor.sort_by('age')
    ages = [int(row['age']) for row in sorted_by_age.data]
    assert ages == sorted(ages), "Should be sorted"
    print(f"[PASS] Sort by age: {ages}")
    
    # 4. 数据统计
    stats = processor.stats('salary')
    assert stats['count'] == 5
    assert stats['sum'] == 52000
    assert stats['avg'] == 10400
    print(f"[PASS] Stats: count={stats['count']}, sum={stats['sum']}, avg={stats['avg']}")
    
    # 5. 导出JSON
    json_output = processor.to_json()
    assert '"name"' in json_output
    print(f"[PASS] Export JSON: {len(json_output)} chars")
    
    # 6. head方法
    head = processor.head(2)
    assert len(head) == 2
    print(f"[PASS] Head(2): {len(head)} rows")
    
    print("=" * 50)
    print("All tests passed!")
    return True


if __name__ == "__main__":
    test_csv_processor()
