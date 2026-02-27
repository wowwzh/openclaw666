# OpenClaw Skills 系统学习

## 技能位置和优先级

| 位置 | 说明 | 优先级 |
|------|------|-------|
| workspace/skills | 当前工作区 | 最高 |
| ~/.openclaw/skills | 本地共享 | 中 |
| bundled skills | 内置技能 | 最低 |

## 技能格式 (SKILL.md)

```yaml
---
name: skill-name
description: 技能描述
metadata: {"openclaw": {"requires": {"bins": ["uv"], "env": ["API_KEY"]}}}
---
# 技能说明
```

## 重要特性

- user-invocable: 用户可通过 /命令 调用
- disable-model-invocation: 不自动调用
- command-dispatch: 直接分发到工具
- 条件加载: requires.bins / env / config

## ClawHub

- 安装: `clawhub install <slug>`
- 更新: `clawhub update --all`
