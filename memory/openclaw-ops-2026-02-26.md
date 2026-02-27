# OpenClaw 运维知识学习笔记

**学习日期**: 2026-02-26
**来源**: https://clawd.org.cn/gateway/troubleshooting.html

---

## 一、故障排除 (Troubleshooting)

### 快速诊断命令
| 命令 | 用途 |
|------|------|
| `openclaw-cn status` | 本地摘要：OS+更新、网关可达性、服务状态 |
| `openclaw-cn status --all` | 完整本地诊断（可分享） |
| `openclaw-cn status --deep` | 网关健康检查（含提供者探测） |
| `openclaw-cn gateway probe` | 网关发现+可达性 |
| `openclaw-cn logs --follow` | 实时日志（最佳诊断信号） |

### 常见问题解决方案

**1. 未找到提供者 API 密钥**
- 原因：代理的身份验证存储为空
- 修复：重新运行入门设置 或 运行 `openclaw-cn models auth setup-token --provider anthropic`

**2. OAuth 令牌刷新失败**
- 修复：运行 `openclaw-cn models auth setup-token --provider anthropic`

**3. Web UI 1006 错误（无原因断开）**
- 场景1（更新后）：清除浏览器 localStorage
- 场景2（Docker）：检查容器重启次数和资源限制
- 场景3（反向代理）：配置 WebSocket 升级头 + 超时

**4. 服务已安装但没运行**
- 检查：`openclaw-cn gateway status`
- 日志：`openclaw-cn logs --follow`

**5. 端口被占用（18789）**
- 检查：`openclaw-cn gateway status`

---

## 二、网关 (Gateway)

### 服务管理命令
```bash
openclaw-cn gateway install    # 安装并启动服务
openclaw-cn gateway status     # 查看服务状态
openclaw-cn gateway restart    # 重启服务
openclaw-cn gateway stop       # 停止服务
```

### 核心配置
- **端口**: 默认 18789，可通过 `--port` 或 `gateway.port` 配置
- **绑定模式**: `loopback`(默认)、`lan`、`tailnet`、`custom`
- **认证**: 默认需要令牌，通过 `gateway.auth.token` 设置

### 热重载
- 配置热重载监控 `~/.openclaw/openclaw.json`
- 默认模式：`gateway.reload.mode="hybrid"`
- 使用 `SIGUSR1` 触发进程内重启

### 多网关支持
- 使用不同端口 + 配置文件实现隔离
- 服务名称：`com.openclaw.<profile>` (macOS) / `clawdbot-gateway-<profile>.service` (Linux)

---

## 三、通道 (Channels)

### 支持的渠道
- **即时通讯**: WhatsApp、Telegram、飞书、Discord、Slack
- **企业**: Microsoft Teams、Google Chat、Mattermost
- **Apple**: iMessage、BlueBubbles
- **其他**: Signal、LINE、Matrix、Nostr、Zalo

### 快速设置
- **Telegram**: 最快（只需 Bot Token）
- **WhatsApp**: 需要 QR 配对

---

## 四、工具 (Tools)

### 工具组快捷方式
- `group:runtime` - exec、bash、process
- `group:fs` - read、write、edit、apply_patch
- `group:sessions` - 会话管理工具
- `group:messaging` - message
- `group:web` - web_search、web_fetch
- `group:browser` - browser、canvas

### 工具配置文件
```json
{
  "tools": {
    "profile": "coding",  // minimal/coding/messaging/full
    "deny": ["group:runtime"]
  }
}
```

### 核心工具
| 工具 | 功能 |
|------|------|
| exec | 运行 shell 命令 |
| process | 管理后台会话 |
| browser | 控制浏览器 |
| canvas | 驱动节点画布 |
| message | 跨平台发消息 |
| cron | 定时任务 |
| nodes | 配对节点管理 |

---

## 五、安全 (Security)

### 快速审计
```bash
openclaw-cn security audit
openclaw-cn security audit --deep
openclaw-cn security audit --fix
```

### 安全原则
1. **身份优先**: 决定谁可以与机器人对话
2. **范围其次**: 决定机器人可以在哪里行动
3. **模型最后**: 假设模型可能被操控

### 私信访问模型
- `pairing`（默认）：需要配对码
- `allowlist`：仅白名单用户
- `open`：允许所有人
- `disabled`：完全忽略

### 配置加固建议
```json
{
  "gateway": {
    "bind": "loopback",
    "auth": { "mode": "token", "token": "your-token" }
  },
  "discovery": {
    "mdns": { "mode": "minimal" }
  }
}
```

### 文件权限
- `~/.openclaw/`: 700（仅用户）
- `~/.openclaw/openclaw.json`: 600

### 提示注入防御
- 保持私信锁定（配对/白名单）
- 群组使用提及门控
- 沙盒中运行敏感工具
- 使用现代指令强化模型

---

## 六、概念 (Model Providers)

### 内置提供商
- **OpenAI**: `OPENAI_API_KEY`
- **Anthropic**: `ANTHROPIC_API_KEY`
- **OpenCode**: `OPENCODE_API_KEY`
- **Google Gemini**: `GEMINI_API_KEY`
- **MiniMax**: 通过 models.providers 配置

### 自定义提供商
- **Moonshot (Kimi)**: OpenAI 兼容端点
- **Ollama**: 本地模型运行
- **LM Studio/vLLM**: 本地代理

### CLI 命令
```bash
openclaw-cn onboard --auth-choice opencode-zen
openclaw-cn models list
openclaw-cn models set openai/gpt-5.2
```

---

## 总结

### 日常运维最常用命令
1. `openclaw-cn status` - 快速检查状态
2. `openclaw-cn logs --follow` - 查看实时日志
3. `openclaw-cn gateway restart` - 重启网关
4. `openclaw-cn security audit` - 安全审计

### 故障排查流程
1. 运行 `openclaw-cn status` 获取概览
2. 查看日志 `openclaw-cn logs --follow`
3. 根据错误类型选择特定解决方案
4. 必要时运行 `openclaw-cn doctor` 自动修复
