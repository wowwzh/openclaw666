# 代码重构技能

提取重复代码为可复用函数。

## 问题

重复代码散落各处：
- 相同逻辑复制粘贴
- 维护困难
- bug需要改多处

## 解决方案

### 1. 检测重复

```python
# 使用工具检测
pip install flake8
flake8 --select=D1 .

# 或使用 PMD/Copy-Paste-Detector
```

### 2. 提取函数

```python
# ❌ Before: 重复代码
def process_user1(data):
    validate(data)
    save(data)
    send_notification(data)

def process_user2(data):
    validate(data)
    save(data)
    send_notification(data)

# ✅ After: 提取公共函数
def process_user(data):
    validate(data)
    save(data)
    send_notification(data)
```

### 3. 重构步骤

1. **识别重复**: 找到相似的代码块
2. **提取函数**: 创建共享函数
3. **替换调用**: 把原代码改为函数调用
4. **测试验证**: 确保功能不变

### 4. 自动化工具

```bash
# Clone Detection
./gradlew detectDuplicates

# IntellJ: Code → Refactor → Extract Method
```

## 原则

- DRY (Don't Repeat Yourself)
- 单一职责
- 保持函数短小
- 命名语义化
