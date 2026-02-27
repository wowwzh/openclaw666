# OpenClaw 高级技能集

## CoworkedShawn/openclaw-skills
**Stars**: ⭐9

### 核心架构技能

#### 1. memory-engine (认知内存系统)
基于 David Badre "On Task" 认知科学
- Input gating - 存储前分类 (P0-P3)
- Output gating - 按任务加载上下文
- Gating policies - 从错误中学习
- Runbooks - 外部化流程记忆

**效果**: 
- Context window 使用 -40%
- 跨会话连续性 ✅

#### 2. prompt-injection-defense (提示注入防护)
4层安全防护
- 用户输入 → Prompt净化 → 上下文路由 → 安全门
- 外部源 → 搜索分析 → 内容审查 → 过滤

**效果**:
- 威胁阻断 99%
- 误报 <3%

#### 3. intent-router (意图路由)
智能模型选择
- 简单查询 → 快速便宜模型 (Haiku)
- 复杂推理 → 高级模型 (Opus)
- 默认 → 平衡模型 (Sonnet)

**效果**:
- API成本 -35%
- 响应质量提升

### 平台集成

| 技能 | 功能 |
|------|------|
| ms-graph-email | M365邮件 |
| wordpress | WordPress发布 |
| meta-social | FB/IG/YouTube发布 |
| thought-leadership-video | HeyGen视频 |

## 安装

```bash
git clone https://github.com/CoworkedShawn/openclaw-skills.git ~/openclaw-skills

# 复制单个技能
cp -r openclaw-skills/memory-engine ~/.openclaw/workspace/skills/

# 或链接所有技能
for skill in ~/openclaw-skills/*/; do
  ln -s "$skill" ~/.openclaw/workspace/skills/$(basename "$skill")
done
```

## 参考
- https://github.com/CoworkedShawn/openclaw-skills
- 博客: https://shawnharris.com/building-a-cognitive-architecture-for-your-openclaw-agent/
