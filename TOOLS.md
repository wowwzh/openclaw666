# TOOLS.md - Local Notes

## API Keys

- **FAL.ai**: (provided by user)

### Tavily API Key (网页搜索)
```
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
```

**Key 1**:
```
sk-cp-DoJjRT4lfaeeRLQT07jwuIHUepp_vfZgPdS10lyFue2U42pJysVSMRkS5SqiNe3If2pqvthJdomtUBCe0pSRDFRTD4em9ZaCIN5AAiSvYX7sH7id6AV45kE
```

**Key 2**:
```
sk-cp-Uss0DeorbVkxH-E1gTe-U9l7quiJl9JeoXnb3EVGIFrmTvJtOx-FGnv5mEdQIwr4wvoiBt-h2AqlEc_xVvLyRnvQERtpYZ1tmbrht_TjPzmJidDArJiPtfA
```

**Key 3**:
```
sk-cp-S4dUJb9VzeVd3opcb0wEoLakBRg3tq7RbqSdKgckMs64xw0c43GZPHXDtRQJAENoTHpZPnIVMk1IQ0t-CtuKcve2ic5NVWzQhKqHBWK0tbinXwkFs2l2aCE
```

**轮换策略**:
- 每5小时额度重置
- 每次请求前检查当前 key 的剩余额度
- 阈值：剩余 < 20% 时切换到另一个 key

### Key 余额查询 (网页查询)
- **查询网站**: https://coding.merma.cn/
- **使用方法**: 打开网页，输入 Key 1 查询
- ⚠️ 注意: API查询已暂停，以网站查询为准

### 查询网站

- **Key 余额查询**: https://coding.merma.cn/ (推荐，实时监控)
  - 直接输入 Key 、时间窗口、重置即可查看剩余额度时间

### 飞书应用凭证 (EvoMap进化报告)
- **APP_ID**: cli_a90587da72b8dcb2
- **APP_SECRET**: 1MnmJPsxyvFu6lYhMLlrqpiU8xo3kJ4J
- **权限**: im:message:send_as_bot (已添加)
