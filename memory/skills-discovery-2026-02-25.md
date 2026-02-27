# Skills Discovery - 2026-02-25

## 凌晨技能挖掘结果

### 发现的热门技能 (skills.sh)

| 技能名 | 热度 | 来源 | 评估 |
|--------|------|------|------|
| agent-browser | 188 | inference-sh-8/skills | ⭐ 已有类似，可参考实现 |
| browser-use | 68 | browser-use/browser-use | ⭐⭐ 需外部下载，参考价值高 |
| ai-image-generation | 191 | inference-sh-8/skills | ⭐ 已有类似 |
| ai-video-generation | 190 | inference-sh-8/skills | ⭐ 已有类似 |
| twitter-automation | 193 | inference-sh-8/skills | ⭐ 可自行实现 |

### GitHub 项目分析

#### 1. browser-use (⭐⭐⭐ 高价值)
- **描述**: 让网站对 AI agent 可访问的 Python 库
- **功能**: 浏览器自动化、表单填写、购物、任务执行
- **特点**: 
  - 支持多种 LLM (OpenAI, Google, Anthropic, Ollama)
  - 提供云端版本 (Browser Use Cloud)
  - 有 Claude Code 官方集成技能
  - MIT 许可证，开源免费
- **评估**: OpenClaw 已有类似浏览器功能，但可参考其架构和工具定义方式

#### 2. Claude Code (⭐⭐ 参考)
- **描述**: Anthropic 的终端编程 agent
- **特点**: 
  - 插件系统 (plugins/)
  - 支持 npm 安装
  - 有 skills 目录可扩展
- **评估**: OpenClaw 定位类似，可参考其技能结构

### 总结

**最有价值的 3 个发现:**

1. **browser-use** - 最火的 AI 浏览器自动化库，架构清晰，可作为 OpenClaw 浏览器模块的参考

2. **agent-browser (skills.sh #7)** - inference.sh 提供的浏览器自动化技能，使用 @e ref 系统的交互方式值得参考

3. **twitter-automation** - 社交媒体自动化技能，OpenClaw 可考虑实现类似技能

---
*挖掘时间: 2026-02-25 02:00*
