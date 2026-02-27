---
name: key-rotation
description: MiniMax API Key 轮换管理 - 自动检查余额并在需要时切换 Key
metadata: {"openclaw": {"requires": {"config": ["browser.enabled"]}, "primaryEnv": "MINIMAX_KEY1"}}
---

# Key Rotation Skill

自动管理 MiniMax API Key 的轮换，确保服务不中断。

## 功能

1. **查询 Key1 余额** - 通过浏览器自动查询 coding.merma.cn
2. **判断切换时机** - Key1 低于 15% 时切换到 Key2
3. **自动切换** - 更新配置文件中的 API Key
4. **状态恢复** - 5 小时后检查 Key1 是否恢复

## 使用方式

```
我帮你查一下 API Key 余额
检查一下 key 状态
```

## 阈值设置

| 参数 | 值 |
|------|-----|
| 切换阈值 | 15% |
| 重置周期 | 5 小时 |
| 检查频率 | 每 10 分钟 |

## Key 轮换策略

### 新方案 (2026-02-17 更新)
**以 Key 1 为主，每 5 小时重置后切回 Key 1**

| 场景 | 操作 |
|------|------|
| Key 1 ≥ 15% | 使用 Key 1 |
| Key 1 < 15% | 切换到 Key 2 |
| Key 2 < 15% | 切换到 Key 3 |
| 每 5 小时重置后 | 切回 Key 1 |

### Key 信息

| Key | 套餐 | 额度 | 查询方式 |
|-----|------|------|----------|
| Key 1 | Plus | 4500/5h | coding.merma.cn (推荐) |
| Key 2 | Plus | 4500/5h | API (需cookie) |
| Key 3 | Starter | 1500/5h | API (需cookie) |

### 查询命令

**Key 1 (推荐)**:
```bash
# 打开 https://coding.merma.cn/ 输入 Key 1 查询
```

**Key 2/3 (API)**:
```bash
# 现在需要cookie，暂不可用
curl -s -L 'https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains' \
  -H 'Authorization: Bearer <API Key>'
```

## 切换日志

每次切换Key时自动记录到 `memory/key-rotation-log.md`

```markdown
## 2026-02-21

| 时间 | 操作 | 原因 |
|------|------|------|
| 04:48 | Key1 → Key2 | Key1 剩余 12% |
```

## 注意事项

- 需要浏览器工具可用
- 切换需要 Gateway 重启
- 建议配合 cron job 使用

## 更新日志

### 2026-02-21
- 新增切换日志功能
