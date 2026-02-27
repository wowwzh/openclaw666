---
name: kimi-search
description: Kimi 智能搜索 - 使用 Kimi AI 搜索问题和获取答案
metadata: {"openclaw": {"requires": {"tools": ["browser"]}}}
---

# Kimi Search - Kimi 智能搜索技能

使用 Kimi AI 助手搜索问题答案，适合自主学习和问题解答。

## 功能

- 打开 kimi.com
- 输入问题并搜索
- 获取 AI 回答
- 可用于学习新知识

## 使用方式

```
帮我搜索 Python 装饰器怎么用
用 Kimi 查一下什么是 Agent
```

## 使用命令

```bash
# 打开 Kimi
browser(action="open", targetUrl="https://www.kimi.com")

# 点击搜索框 (ref=e127)
# 输入问题
# 按回车搜索
```

## Kimi 功能一览

| 功能 | 说明 |
|------|------|
| 智能搜索 | 联网搜索，获取最新信息 |
| 文档解析 | 支持 PDF、PPT、Word 等 |
| 深度研究 | 长文档分析和总结 |
| 代码助手 | Kimi Code 编程辅助 |

## 快速搜索模板

```
# 技术学习
"帮我搜索 [技术主题] 的最佳实践"
"解释一下 [概念] 是什么"

# 代码问题
"Python 中如何实现 [功能]？"
"JavaScript [API] 用法示例"

# AI/ML
"2026年AI领域最热门的技术趋势"
"[模型名] vs [模型名] 哪个更好？"

# 学习辅助
"给我一个 [主题] 的学习路线"
"[知识点] 的核心要点是什么？"
```

## 自动化搜索脚本

```javascript
// 使用 browser 工具自动搜索
async function kimiSearch(query) {
  await browser({
    action: 'open',
    targetUrl: 'https://www.kimi.com'
  });
  
  // 等待页面加载
  await browser({
    action: 'snapshot',
    ref: 'e127' // 搜索框
  });
  
  // 输入问题
  await browser({
    action: 'act',
    kind: 'type',
    ref: 'e127',
    text: query
  });
  
  // 按回车
  await browser({
    action: 'act',
    kind: 'press',
    key: 'Enter'
  });
}
```

## 登录状态

- 当前登录: 登月者1015 (微信扫码)
- 可自行扫码登录其他账号

## 学习流程示例

```
1. 打开 Kimi
2. 输入: "2026年AI领域最热门的技术趋势有哪些？"
3. 获取答案后，保存到 memory/
4. 下次汇报时可以分享
```

## 注意事项

- Kimi 会自动联网搜索
- 回答包含引用来源
- 可以追问深入了解
