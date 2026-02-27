---
name: minimax-coding
description: MiniMax Coding Plan API 封装 - 通过 exec 工具调用 MiniMax 编程接口
metadata: {"openclaw": {"requires": {"tools": ["exec"]}}}
---

# MiniMax Coding Plan Skill

通过 exec 工具封装对 MiniMax Coding Plan API 的调用。

## 功能

1. **余额查询** - 查询 API Key 剩余额度
2. **代码生成** - 使用 MiniMax 模型生成代码
3. **代码审查** - 使用 MiniMax 模型审查代码

## 使用方式

### 1. 余额查询

```bash
# 查询 Key 1 余额
curl -s "https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 2. 代码生成

使用 OpenClaw 内置的 MiniMax 模型即可进行代码生成。

## 已配置的 API Keys

| Key | 状态 |
|-----|------|
| Key 1 (sk-cp-DoJjRT4lfaeeRLQT07jwuIHUepp_vfZgPdS10lyFue2U42pJysVSMRkS5SqiNe3If2pqvthJdomtUBCe0pSRDFRTD4em9ZaCIN5AAiSvYX7sH7id6AV45kE) | 主用 |
| Key 2 (sk-cp-Uss0DeorbVkxH-E1gTe-U9l7quiJl9JeoXnb3EVGIFrmTvJtOx-FGnv5mEdQIwr4wvoiBt-h2AqlEc_xVvLyRnvQERtpYZ1tmbrht_TjPzmJidDArJiPtfA) | 备用 |
| Key 3 (sk-cp-S4dUJb9VzeVd3opcb0wEoLakBRg3tq7RbqSdKgckMs64xw0c43GZPHXDtRQJAENoTHpZPnIVMk1IQ0t-CtuKcve2ic5NVWzQhKqHBWK0tbinXwkFs2l2aCE) | 备用 |

## 注意事项

- OpenClaw 已内置 MiniMax 模型支持
- 无需额外配置 MCP Server
- 直接使用内置模型即可获得 Coding Plan 能力
