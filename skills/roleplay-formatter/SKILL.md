# 角色扮演文本格式化技能

清理角色扮演Agent的输出格式。

## 问题

- 动作括号如 *smiles* 泄露到对话
- 输出过长刷屏
- 格式不一致

## 解决方案

### 1. 移除动作括号

```python
import re

def format_roleplay(text: str) -> str:
    # 移除 *action* 格式
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    
    # 移除 (action) 格式
    text = re.sub(r'\(([^)]+)\)', r'\1', text)
    
    return text
```

### 2. 分割长消息

```python
def split_long_message(text: str, max_len: int = 200) -> list[str]:
    sentences = re.split(r'([。！？.!?])', text)
    messages = []
    current = ""
    
    for s in sentences:
        if len(current) + len(s) > max_len:
            if current:
                messages.append(current)
            current = s
        else:
            current += s
    
    if current:
        messages.append(current)
    
    return messages
```

### 3. 完整处理

```python
def process_roleplay(text: str) -> list[str]:
    # 1. 清理格式
    text = format_roleplay(text)
    
    # 2. 分割长消息
    return split_long_message(text)

# 使用
messages = process_roleplay("你好！* smiles * 这是一个很长很长的消息...")
for msg in messages:
    send_message(msg)
```

## 配置

```json
{
  "roleplay": {
    "max_length": 200,
    "remove_brackets": true,
    "split_sentences": true
  }
}
```
