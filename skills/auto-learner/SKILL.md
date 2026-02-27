---
name: auto-learner
description: |
  让 AI 代理自主从论坛和网站学习编程知识。当用户说"学习xxx"、"研究xxx"、"了解一下xxx"时触发。
  功能包括：(1) 搜索发现相关编程内容 (2) 爬取高质量页面 (3) 用 LLM 提取关键知识点 (4) 保存到本地知识库
---

# Auto-Learner 自主学习技能

## 触发条件

用户说以下话时自动触发：
- "学习xxx"
- "研究xxx"
- "了解一下xxx"
- 遇到问题时主动触发（不需要用户说）

## 主动学习流程（遇到问题时）

1. **分析问题** - 理解问题本质
2. **搜索方案** - 用 Kimi 查找解决方案
3. **尝试解决** - 按照搜到的方案测试
4. **记录结果** - 成功/失败都记下来

## 遇到需要登录的网站

1. **扫码登录** → 截图发给哥哥协助扫码
2. **手机号验证码** → 直接输入手机号 → 发送验证码 → 问哥哥要验证码 → 自己输入登录
3. **自己主动点**，不要等哥哥提醒

---

## 使用 Kimi 搜索答案

**Kimi 网页版：** https://www.kimi.com

**登录后使用方法：**
1. 打开 https://www.kimi.com
2. 在输入框输入问题
3. Kimi 会自动搜索网页并给出答案

**搜索技巧：**
- 问题要描述清楚
- 可以加上"解决方案"、"怎么解决"等关键词
- 如果第一次结果不满意，可以追问
- "帮我看看xxx是什么"
- "帮我了解一下xxx"

## 工作流程

### 1. 内容发现

使用 `web_search` 搜索相关编程论坛：
- StackOverflow
- GitHub Discussions
- V2EX
- 掘金
- CSDN

如果搜索不可用，直接用已知的高质量技术网站。

### 2. 内容爬取

使用 `web_fetch` 或 `browser` 获取页面内容：
```python
url = "https://example.com/tech-article"
content = web_fetch(url)
```

### 3. 知识提取

用 LLM 提取关键知识点，格式如下：
```json
{
  "概念": ["核心概念1", "核心概念2"],
  "代码示例": ["代码片段"],
  "最佳实践": ["实践1", "实践2"],
  "常见陷阱": ["坑1", "坑2"]
}
```

### 4. 知识存储

保存到 `memory/knowledge/` 目录，文件名用主题名：
```json
{
  "url": "来源URL",
  "title": "标题",
  "learned_at": "时间戳",
  "key_points": {...},
  "summary": "一句话总结"
}
```

## 知识库位置

`memory/knowledge/*.json`

## 输出格式

学习完成后，告诉用户：
1. 学到了什么（关键概念）
2. 来源是哪里
3. 有什么值得注意的

## 注意事项

- 优先选择高质量权威来源
- 内容太长时只提取前3000字符
- 提取知识点要简洁明确

## ⚠️ 限制条件

- **不访问外网**：谷歌、YouTube、Twitter 等国外网站忽略
- **优先国内**：优先使用国内的免费技术资源
- **优先免费**：优先使用免费的服务和工具

### 国内常用技术网站

- 掘金：https://juejin.cn
- 知乎：https://www.zhihu.com
- CSDN：https://blog.csdn.net
- 菜鸟教程：https://www.runoob.com
- 腾讯云开发者社区：https://cloud.tencent.com/developer
- 阿里云开发者社区：https://developer.aliyun.com
- 墨客导航：https://mook.ai

## 已学习的技能

参考 `references/document-processing.md` 获取：
- PDF 读写、提取表格
- Word (DOCX) 创建和编辑
- Excel (XLSX) 数据处理

---

## ⚠️ Exec 工具修复

**问题：** OpenClaw 2026.2.15 在 Windows 上执行 PowerShell 无输出（bug #2165）

**解决方案：** 使用 `pty: true` 参数

```python
# 正确写法
exec(command="powershell -Command \"echo test\"", pty=True)

# 错误写法（无输出）
exec(command="powershell -Command \"echo test\"")
```

**验证成功的命令：**
- `powershell -Command "Get-ChildItem"` - 查看目录
- `powershell -Command "Get-Process"` - 查看进程
- `powershell -Command "Test-Connection"` - 网络测试
