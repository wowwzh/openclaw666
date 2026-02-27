---
name: config-backup
description: 配置备份与自动恢复系统 - 配置文件监控、自动备份、Gateway自动重启
metadata: {"openclaw": {"requires": {"tools": ["exec", "cron"]}}}
---

# 配置备份与恢复系统

用于配置文件出错时自动恢复，以及 Gateway 自动重启。

## 系统架构

```
配置文件 → 监控模块 → 校验 → 备份/恢复 → Gateway重启
```

## 核心功能

### 1. 配置监控模块
- 监控关键配置文件变化
- 支持 JSON/YAML 格式
- 定时备份

### 2. 配置验证器
- 检查必填字段
- 验证数据类型
- 验证业务逻辑

### 3. 备份管理器
- 自动备份配置
- 版本管理
- Hash 校验

### 4. 自动恢复模块
- 检测配置错误
- 自动回滚到正确版本
- 告警通知

### 5. Gateway 自动重启
- 检测 Gateway 状态
- 自动启动/重启
- 健康检查

## 需要备份的关键文件

| 文件 | 路径 |
|------|------|
| Gateway配置 | ~/.openclaw/config.json |
| 技能配置 | workspace/skills/*/SKILL.md |
| 记忆文件 | workspace/memory/*.md |

## Gateway 状态检查命令

```bash
# 检查 Gateway 状态
openclaw gateway status

# 启动 Gateway (需要手动执行)
openclaw gateway start

# Windows 上可以用
start openclaw
```

## 自动恢复触发条件

- 配置文件解析失败
- 必填字段缺失
- 数值范围错误
- Gateway 无响应

## 注意事项

- ⚠️ 自动重启 Gateway 需要哥哥授权
- 备份文件保留最近 5 个版本
- 每次修改配置前先手动备份

## 待实现

- [x] 定时备份脚本 (scripts/backup-config.ps1)
- [x] Gateway 健康检查 (scripts/check-gateway.ps1)
- [x] 健康检查定时任务 (每5分钟)
- [ ] 配置校验规则
- [ ] 自动恢复流程 (需要哥哥授权)
