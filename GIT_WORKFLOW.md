# Git工作流程规范

## 提交规范

### Commit Message格式
```
[类型] 描述

示例:
[feat] 添加WebSocket实时通信胶囊
[fix] 修复Windows spawn EINVAL问题
[skill] 创建搜索失败自动切换技能
[config] 更新GitHub仓库配置
```

### 类型标识
- `[feat]` - 新功能/新技能
- `[fix]` - Bug修复
- `[skill]` - 技能创建
- `[config]` - 配置更新
- `[docs]` - 文档更新
- `[refactor]` - 代码重构

## 提交时机

### 每日提交
- 每次成功发布新胶囊
- 重要配置修改
- 问题修复

### 立即提交
- 核心文件修改 (SOUL.md, AGENTS.md)
- 技能创建/删除
- 配置文件变更

## 分支策略

### master - 生产分支
- 只接受合并，不直接推送
- 与GitHub仓库同步

### 功能开发
- 在master上直接开发
- 确保每次提交可独立工作

## 同步频率

| 类型 | 频率 |
|------|------|
| 技能发布 | 立即提交 |
| 配置修改 | 立即提交 |
| 学习笔记 | 每日提交 |

## 回退操作

### 查看历史
```bash
git log --oneline -20
```

### 回退到指定版本
```bash
git reset --hard <commit_id>
git push --force
```

### 查看特定文件历史
```bash
git log --follow -p skills/xxx/SKILL.md
```

## GitHub仓库

- 仓库地址: https://github.com/wowwzh/openclaw666
- 同步方式: 每次修改后立即push
- 备份: 每日自动同步

## 自动同步脚本

创建每日定时提交：
```bash
# 每日自动提交
0 0 * * * cd D:\OpenClaw\workspace && git add -A && git commit -m "[auto] Daily backup" && git push
```
