# OpenClaw 运维知识学习笔记

**日期**: 2026-02-24

## 一、故障排除 (Troubleshooting)

### 快速诊断命令
| 命令 | 用途 |
|------|------|
| `openclaw-cn status` | 本地摘要：操作系统+更新、网关可达性、服务状态 |
| `openclaw-cn status --all` | 完整本地诊断（可粘贴分享） |
| `openclaw-cn status --deep` | 网关健康检查+提供者探测 |
| `openclaw-cn gateway probe` | 网关发现+可达性 |
| `openclaw-cn logs --follow` | 实时日志（运行时问题最佳信号） |

### 常见问题

#### 1. API 密钥未找到
- 原因：代理的身份验证存储为空或缺少凭据
- 解决：`openclaw-cn models auth setup-token --provider anthropic`

#### 2. OAuth 令牌刷新失败
- 推荐修复：`openclaw-cn models auth setup-token --provider anthropic`

#### 3. Web UI "pairing required" 错误
- 容器化部署常见问题
- 快速修复：
  ```bash
  openclaw-cn config set gateway.controlUi.allowInsecureAuth true
  openclaw-cn gateway restart
  ```

#### 4. Web UI "1006: no reason" 错误
- 原因：浏览器缓存旧token、Docker崩溃、网络问题
- 解决：清除浏览器localStorage，或增加Docker内存限制

#### 5. 服务运行但端口未监听
- 检查 gateway.mode 是否为 local
- 检查是否需要认证 (bind 设置为 lan/tailnet 时)
- 使用 `openclaw-cn gateway status` 查看详情

#### 6. 消息不触发
- 检查发送者是否在允许列表
- 检查群聊是否需要 @提及
- 检查日志中的 blocked/skipped 信息

## 二、网关 (Gateway)

### 服务管理命令
```bash
openclaw-cn gateway install    # 安装并启动服务
openclaw-cn gateway status    # 查看运行状态
openclaw-cn gateway restart   # 重启服务
openclaw-cn gateway stop      # 停止服务
openclaw-cn logs --follow     # 实时日志
```

### 配置要点
- 默认端口：18789
- 模式：local（本地运行）或 remote（远程）
- 绑定：loopback（默认）、lan、tailnet、custom
- 热重载：默认 hybrid 模式

### 监管方式
- macOS: launchd (LaunchAgent)
- Linux: systemd (用户服务)
- Windows: WSL2 + systemd

### 多网关支持
- 需要隔离状态+配置+唯一端口
- 开发模式：`openclaw-cn --dev gateway --allow-unconfigured`

## 三、通道 (Channels)

### 支持的消息平台
- **WhatsApp** - 需要 QR 配对
- **Telegram** - Bot API，最快设置
- **飞书/Feishu** - 支持私聊和群组
- **Discord** - 服务器、频道、DM
- **Slack** - Workspace apps
- **Signal** - 注重隐私
- **iMessage** - macOS 专用 (推荐 BlueBubbles)
- **Microsoft Teams** - 企业支持
- **LINE** - 需插件

## 四、工具 (Tools)

### 核心工具列表

| 工具 | 功能 |
|------|------|
| exec | 在工作区运行 shell 命令 |
| process | 管理后台执行会话 |
| browser | 控制 OpenClaw 浏览器 |
| canvas | 驱动节点画布渲染 |
| nodes | 发现和控制配对节点 |
| web_search | 使用 Brave API 搜索 |
| web_fetch | 获取网页内容 |
| image | 分析图像 |
| message | 跨平台发送消息 |
| cron | 管理定时任务 |
| gateway | 重启/更新网关 |
| sessions_* | 会话管理工具 |

### 工具配置
- 使用 `tools.allow` / `tools.deny` 控制工具访问
- 支持工具组：`group:fs`, `group:runtime`, `group:messaging` 等
- 工具配置文件：minimal, coding, messaging, full

### 安全配置
```json
{
  "tools": {
    "deny": ["browser"],  // 禁用浏览器工具
    "profile": "coding"   // 基础配置文件
  }
}
```

## 五、关键运维技巧

### 日志位置
- 文件日志：`/tmp/openclaw/openclaw-YYYY-MM-DD.log`
- macOS LaunchAgent: `$OPENCLAW_STATE_DIR/logs/`
- Linux systemd: `journalctl --user -u clawdbot-gateway`

### 认证配置
- 本地访问：使用 `gateway.auth.token`
- 远程访问：优先使用 Tailscale Serve
- Web UI：不安全模式用 `gateway.controlUi.allowInsecureAuth: true`

### 资源限制
- Docker 部署建议内存：≥1GB
- 定期清理会话历史：`session.historyLimit`

## 六、常用故障排查流程

1. **服务状态** → `openclaw-cn status`
2. **深度检查** → `openclaw-cn status --deep`
3. **查看日志** → `openclaw-cn logs --follow`
4. **健康检查** → `openclaw-cn health --json`
5. **医生诊断** → `openclaw-cn doctor`

---

*持续更新中...*
