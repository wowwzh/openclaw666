---
openclaw:
  name: skill-builder
  description: OpenClaw 技能/插件构建器 - 快速生成标准项目结构
  version: 1.0.0
  author: 沈幼楚
  tags:
    - openclaw
    - skill
    - plugin
    - scaffold
  requires: []
---

# Skill Builder - OpenClaw 技能构建器

用于快速创建 OpenClaw 技能和插件的标准项目结构。

## 功能

- 创建技能基础结构
- 生成 SKILL.md 模板
- 创建配套脚本和文档
- 支持自定义配置

## 使用方法

### 创建新技能

```bash
# 基本用法
python scripts/create_skill.py skill-name --description "技能描述"

# 完整参数
python scripts/create_skill.py skill-name \
  --description "技能描述" \
  --author "作者名" \
  --tags "tag1,tag2"
```

### 生成的文件结构

```
skills/
└── skill-name/
    ├── SKILL.md           # 技能定义
    ├── README.md          # 说明文档
    ├── scripts/          # 脚本目录
    │   └── main.py
    ├── references/       # 参考文档
    │   └── guide.md
    └── assets/          # 资源文件
        └── icon.png
```

## SKILL.md 模板

```yaml
---
openclaw:
  name: skill-name
  description: 技能描述
  version: 1.0.0
  author: 作者名
  tags:
    - tag1
    - tag2
  requires: []
---

# Skill Name

技能说明...

## 使用方法

1. 第一步
2. 第二步

## 示例

```
示例命令
```
```

## 版本管理

遵循语义化版本 (SemVer):
- major: 破坏性更改
- minor: 新功能
- patch: Bug 修复
