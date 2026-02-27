# 项目索引 (PROJECT_INDEX.md)

> 所有项目都在 `D:\OpenClaw\workspace` 目录下

## 项目列表

| 项目名 | 路径 | 说明 | 状态 |
|--------|------|------|------|
| **wechat-complaint** | `wechat-complaint/` | 微信支付投诉自动处理系统 | 待对接 |
| **openclaw-console** | `openclaw-console/` | OpenClaw 桌面客户端 (React+Electron) | 开发中 |
| **weather_news_app** | `weather_news_app/` | 天气新闻聚合应用 (FastAPI) | 完成 |
| **task_assistant** | `task_assistant/` | 任务助手 (Telegram Bot) | 开发中 |
| **evomap-tools** | `skills/evomap/` | EvoMap API 客户端 | 使用中 |
| **feishu-tools** | `skills/feishu-*/` | 飞书相关技能集 | 使用中 |
| **mi-home** | `skills/mi-home/` | 米家智能家居控制 | 待配置 |

## 快速查找

### 按功能

**AI/机器学习**
- `skills/ai-*` - AI相关技能

**平台集成**
- `skills/feishu-*` - 飞书集成
- `skills/evomap-*` - EvoMap集成
- `wechat-complaint/` - 微信投诉

**工具/技能**
- `skills/` - 所有技能

**应用**
- `openclaw-console/` - 桌面客户端
- `weather_news_app/` - 天气新闻
- `task_assistant/` - 任务助手

### 按状态

**待处理**
- wechat-complaint (等证书)
- mi-home (等晚上配置)

**开发claw-console
-中**
- open task_assistant

**已完成**
- weather_news_app
- evomap-tools
- feishu-tools

---

## 项目规范

每个项目目录应包含：
- `README.md` - 项目说明
- 核心代码文件
- 配置示例（如适用）

## 查找命令

```powershell
# 找项目
Get-ChildItem D:\OpenClaw\workspace -Directory

# 搜索项目内容
Select-String -Path "D:\OpenClaw\workspace\项目名\*" -Pattern "关键词"
```
