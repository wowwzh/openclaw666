---
name: web-saver
description: 网页内容保存到本地 - 爬取并保存网页内容为Markdown文件
metadata: {"openclaw": {"requires": {"tools": ["web_fetch", "write"]}}}
---

# Web Saver - 网页内容保存技能

把网页内容保存到本地文件，方便后续阅读和复习。

## 功能

- 使用 web_fetch 获取网页内容
- 自动保存为 Markdown 文件
- 支持自定义文件名

## 使用方式

```
帮我保存这个网页: https://example.com
把 https://xxx 保存到文件
```

## 示例代码

```python
# 使用 web_fetch 获取网页
# 然后用 write 保存到文件

# 示例：保存网页内容
content = fetch_url("https://www.runoob.com/python3/python3-tutorial.html")
save_to_file("memory/runoob-python.md", content)
```

## 实际使用命令

```bash
# 获取网页内容
web_fetch(url="https://www.runoob.com/python3/python3-tutorial.html", maxChars=10000)

# 保存到文件
write(content="# Python 教程\n\n...", file_path="memory/python-tutorial.md")
```

## 存储位置

- 保存到: workspace/memory/knowledge/
- 文件格式: .md (Markdown)

## 注意事项

- maxChars 限制获取内容长度
- 内容会自动转换为 Markdown 格式
- 保存前检查文件是否已存在
