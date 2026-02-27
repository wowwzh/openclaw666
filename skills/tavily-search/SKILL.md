---
name: tavily-search
description: 使用 Tavily 进行网络搜索 - LLM 优化的搜索 API，返回相关结果、内容片段、评分和元数据
icon: 🔍
metadata:
  openclaw:
    env:
      TAVILY_API_KEY: required
---
# Tavily Search

使用 Tavily 的 LLM 优化搜索 API 进行网络搜索。

## 使用方法

直接告诉我你想搜索什么，例如：
- "搜索最新的 AI 新闻"
- "Search Python 异步编程最佳实践"
- "查一下 MiniMax M2.5 的最新消息"

## 环境变量

需要设置 `TAVILY_API_KEY`：
- 免费注册：https://app.tavily.com
- 付费用户可生成 Production key（`tvly-` 开头）
- 开发版 key（`tvly-dev-`）仅支持 MCP，不支持 REST API

## 技能说明

当用户需要搜索互联网上的最新信息时使用此技能。Tavily 特别适合：
- 时事新闻搜索
- 技术文档和教程搜索
- 产品/竞争对手信息搜索
- 任何需要最新网络信息的问题

返回结果包含：
- 搜索结果标题和 URL
- 内容摘要
- 相关性评分
- 发布日期（如果有）

## 实现

使用 curl 调用 Tavily REST API：
```bash
curl -s "https://api.tavily.com/search?api_key=$TAVILY_API_KEY&query=<搜索内容>&max_results=5"
```

解析 JSON 结果并格式化输出给用户。
