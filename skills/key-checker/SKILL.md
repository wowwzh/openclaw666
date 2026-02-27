---
name: key-checker
description: MiniMax API Key 余额检查 - 通过网页查询Key余额
metadata: {"openclaw": {"requires": {"tools": ["browser"], "config": ["MINIMAX_KEY1"]}}}
---

# Key Checker - API Key 余额检查技能

查询 MiniMax Coding Plan API Key 的剩余额度。

## 功能

- 打开 coding.merma.cn 查询页面
- 自动输入 Key 并查询
- 读取余额信息

## 使用方式

```
帮我查一下 Key 余额
检查 API Key 还剩多少
```

## Key 轮换策略

| 场景 | 操作 |
|------|------|
| Key 1 ≥ 15% | 使用 Key 1 |
| Key 1 < 15% | 切换到 Key 2 |
| Key 2 < 15% | 切换到 Key 3 |
| 每 5 小时重置后 | 切回 Key 1 |

## API Keys

```
Key 1: sk-cp-DoJjRT4lfaeeRLQT07jwuIHUepp_vfZgPdS10lyFue2U42pJysVSMRkS5SqiNe3If2pqvthJdomtUBCe0pSRDFRTD4em9ZaCIN5AAiSvYX7sH7id6AV45kE
Key 2: sk-cp-Uss0DeorbVkxH-E1gTe-U9l7quiJl9JeoXnb3EVGIFrmTvJtOx-FGnv5mEdQIwr4wvoiBt-h2AqlEc_xVvLyRnvQERtpYZ1tmbrht_TjPzmJidDArJiPtfA
Key 3: sk-cp-S4dUJb9VzeVd3opcb0wEoLakBRg3tq7RbqSdKgckMs64xw0c43GZPHXDtRQJAENoTHpZPnIVMk1IQ0t-CtuKcve2ic5NVWzQhKqHBWK0tbinXwkFs2l2aCE
```

## 使用命令

```bash
# 打开查询网站
browser(action="open", targetUrl="https://coding.merma.cn/")

# 输入 Key (在输入框填入 Key)
# 点击"查询状态"按钮
```

## 读取余额信息

查询后查看页面显示：
- 时间窗口 (例如: 10:00-15:00)
- 重置时间 (例如: 3分钟后重置)
- 剩余调用 (例如: 2253/4500)
- 剩余天数 (例如: 26天)

## 注意事项

- Key 1 可以通过网页查询
- Key 2/3 需要 cookie，暂不可用
- 每5小时额度重置一次
