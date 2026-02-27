# 技能发现记录 - 2026-02-24

## 一、skills.sh 热门技能分析

### 高价值技能（与 OpenClaw 相关）

| 技能名 | 安装量 | 热度 | 评估 |
|--------|--------|------|------|
| **agent-browser** | 152 | +152 | ⭐ 高度相关，可整合浏览器控制能力 |
| **python-executor** | 57 | +57 | ⭐ 已有能力，需优化 |
| **web-search** | 49 | +49 | ⭐ 现有 web_search 工具类似 |
| **speech-to-text** | 44 | +44 | 🔄 现有 tts 工具已有语音能力 |
| **text-to-speech** | 37 | +37 | ✅ 已有 tts 工具 |
| **ai-automation-workflows** | 35 | +35 | 🔄 可借鉴工作流思路 |
| **ai-rag-pipeline** | 34 | +34 | 📋 RAG 知识库场景 |
| **twitter-automation** | 157 | +157 | 🔄 已有 message 工具 |

### Azure 生态技能（微软系）
- appinsights-instrumentation, azure-deploy, azure-rbac 等
- 适合企业场景集成

## 二、GitHub AI Agent 热门项目

### 1. **CowAgent** ⭐⭐⭐
- 全能 AI 助理，支持飞书/钉钉/企业微信
- 多模型支持：OpenAI/Claude/Gemini/DeepSeek/Qwen/GLM/Kimi
- **价值**：与 OpenClaw 定位相似，可参考多平台接入架构

### 2. **CopilotKit/CopilotKit** ⭐⭐⭐
- 生成式 UI 的 React/Angular 框架
- **价值**：可用于构建 AI Agent UI 组件

### 3. **activepieces/activepieces** ⭐⭐⭐
- AI 工作流自动化平台
- 400+ MCP 服务器
- **价值**：MCP 生态丰富，可探索集成

### 4. **trycua/cua** ⭐⭐⭐
- 计算机使用代理的开源基础设施
- 支持 macOS/Linux/Windows 桌面控制
- **价值**：与 OpenClaw Browser 能力直接竞争

### 5. **e2b-dev/E2B** ⭐⭐
- 企业级代理的安全执行环境
- **价值**：代码沙箱执行参考

## 三、结论与建议

### 已具备能力（无需重复开发）
- ✅ 浏览器控制 (browser 工具)
- ✅ 语音合成 (tts 工具)
- ✅ 网页搜索
- ✅ Python 执行

### 可探索方向
1. **RAG 知识库** - 可结合 feishu_wiki 构建知识管理
2. **MCP 服务器集成** - 探索 activepieces 的 MCP 生态
3. **工作流自动化** - 借鉴 activepieces 设计

---
*凌晨 2:00 发现记录*
