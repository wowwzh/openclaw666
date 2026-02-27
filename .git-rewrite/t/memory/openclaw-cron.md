# OpenClaw Cron 定时任务

## 两种执行模式

| 模式 | 说明 | 用途 |
|------|------|------|
| main | 在主会话中运行 system event | 需要主会话上下文 |
| isolated | 独立会话，隔离运行 | 独立任务，定期报告 |

## 调度类型

- `at`: 一次性时间 (ISO 8601)
- `every`: 固定间隔 (ms)
- `cron`: Cron 表达式

## 交付模式

- `announce`: 交付摘要到目标频道
- `webhook`: 发送到 URL
- `none`: 不交付

## 创建示例

```bash
# 一次性提醒
openclaw cron add --name "提醒" --at "2026-02-01T16:00:00Z" --session main --system-event "提醒内容"

# 定期任务
openclaw cron add --name "早报" --cron "0 7 * * *" --tz "Asia/Shanghai" --session isolated --message "汇总" --announce --channel feishu
```

## 重要特性

- 任务持久化在 `~/.openclaw/cron/jobs.json`
- isolated 任务默认 announce（交付摘要）
- 失败自动重试（指数退避）
- 可以绑定到特定 agent
