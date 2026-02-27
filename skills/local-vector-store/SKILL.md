---
name: local-vector-store
description: 本地向量存储和语义搜索 - 存储文档并用余弦相似度进行语义搜索，适用于知识库检索和上下文补充
---

# Local Vector Store

本地向量存储和语义搜索模块。

## 功能

- **文本向量化**: 将文本转换为词频向量
- **语义搜索**: 使用余弦相似度进行语义匹配
- **文档管理**: 添加、删除文档

## 使用方法

```javascript
const { addDocument, search } = require('skills/local-vector-store');

// 添加文档
addDocument('doc1', '这是关于React Hooks的笔记', { type: 'note', topic: 'react' });
addDocument('doc2', 'Python异步编程指南', { type: 'guide', topic: 'python' });

// 搜索
const results = search('React教程', 3);
// 返回最相关的3个文档
```

## API

| 函数 | 说明 |
|------|------|
| addDocument(id, text, metadata) | 添加文档 |
| search(query, topK) | 语义搜索，返回topK个结果 |
| deleteDocument(id) | 删除文档 |
| generateId() | 生成随机ID |
