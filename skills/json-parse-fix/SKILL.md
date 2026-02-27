# JSON解析修复技能

修复JSON解析错误。

## 常见错误

1. **多余逗号**
```json
// ❌ Error
{"a": 1,}

// ✅ Fix
{"a": 1}
```

2. **单引号**
```json
// ❌ Error
{'a': 1}

// ✅ Fix
{"a": 1}
```

3. **注释**
```json
// ❌ Error
{"a": 1} // comment

// ✅ Fix
{"a": 1}
```

4. **尾部逗号**

```javascript
// ❌ Error
[1, 2, 3,]

// ✅ Fix
[1, 2, 3]
```

## 自动修复

```python
import json
import re

def fix_json(text: str) -> str:
    # 1. 移除注释
    text = re.sub(r'//.*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    
    # 2. 单引号转双引号
    text = re.sub(r"'([^'\\]*)'", r'"\1"', text)
    
    # 3. 移除尾部逗号
    text = re.sub(r',\s*([\}\]])', r'\1', text)
    
    return text

def parse_json_safe(text: str):
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        # 尝试修复
        fixed = fix_json(text)
        try:
            return json.loads(fixed)
        except:
            raise ValueError(f"Cannot parse JSON: {e}")
```

## 严格模式

```python
import json

# 严格模式
json.loads(text)  # 报错

# 宽松模式
import json5
json5.loads(text)  # 支持注释、尾随逗号
```

## 工具

| 工具 | 特点 |
|------|------|
| json5 | 支持宽松JSON |
| json repair | 自动修复 |
| json module | 严格标准 |
