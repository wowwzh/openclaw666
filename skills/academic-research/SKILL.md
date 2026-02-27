# Academic Research Assistant

学术研究助手 - 自动搜索和理解学术论文

## 功能
- 搜索学术论文 (arXiv + Semantic Scholar)
- 提取论文摘要
- 生成文献综述
- 分析研究趋势
- **新增(2026-02-21)**: 热门趋势、论文推荐、趋势分析

## 使用方法

```javascript
const { AcademicResearcher } = require('./academic-researcher.js');

const researcher = new AcademicResearcher();

// 研究某个主题
const result = await researcher.research('AI Agent');
console.log(result.review);

// 获取热门研究趋势 (新增)
const trending = await researcher.getTrendingTopics();
console.log(trending);

// 推荐论文 (新增)
const recommended = await researcher.recommendPapers('LLM');
console.log(recommended);

// 趋势分析 (新增)
const trends = await researcher.analyzeTrends(papers);
console.log(trends);
```

## 新增功能详解

### getTrendingTopics()
获取当前热门研究领域
```javascript
{
  timestamp: "2026-02-21T00:41:00Z",
  topics: [
    { rank: 1, topic: "Large Language Models", hotness: 100 },
    { rank: 2, topic: "Multimodal AI", hotness: 90 },
    ...
  ]
}
```

### recommendPapers(topic)
基于引用量推荐高质量论文
```javascript
{
  topic: "LLM",
  recommended: [
    { title: "...", authors: "...", year: 2024, citations: 1000 }
  ]
}
```

### analyzeTrends(papers)
分析论文集合的研究趋势
```javascript
{
  yearDistribution: { "2023": 5, "2024": 8 },
  topAuthors Name: { "Author": 3 },
  venues: { "NeurIPS": 4 },
  keywords: ["LLM", "Transformer", "Agent"]
}
```
