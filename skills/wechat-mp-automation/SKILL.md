# 微信公众号自动化技能

## wemp-operator

**项目**: IanShaw027/wemp-operator
**Stars**: ⭐24
**功能**: 微信公众号自动化运营

### 功能特性

| 功能 | 说明 |
|------|------|
| 📝 内容采集 | 从20+数据源智能采集热点，支持关键词过滤 |
| 📊 数据分析 | 自动生成日报/周报，包含AI洞察 |
| 💬 互动管理 | 评论检查、智能回复建议、批量精选 |

### 支持的数据源

**科技**: hackernews, github, v2ex, sspai, juejin, ithome, producthunt

**中文热点**: weibo, zhihu, baidu, douyin, bilibili, toutiao, tencent, thepaper, hupu

**财经**: 36kr, wallstreetcn, cls

### 安装

```bash
# 方式1: ClawHub安装（推荐）
openclaw skill install IanShaw027/wemp-operator

# 方式2: 手动安装
git clone https://github.com/IanShaw027/wemp-operator.git ~/.openclaw/skills/wemp-operator
```

### 配置

在 `~/.openclaw/openclaw.json` 中配置公众号：

```json
{
  "channels": {
    "wemp": {
      "enabled": true,
      "appId": "你的公众号AppID",
      "appSecret": "你的公众号AppSecret"
    }
  }
}
```

### 使用

**触发词**:
- 内容采集: "采集热点", "采集新闻", "收集素材"
- 数据分析: "公众号日报", "公众号周报", "数据报告"
- 互动管理: "检查评论", "回复评论", "精选评论"

**示例**:
- "帮我采集今天的AI热点"
- "生成公众号日报"
- "检查公众号新评论"

### API模块 (70个)

- 统计API (8)
- 草稿API (6)
- 发布API (5)
- 评论API (8)
- 用户API (7)
- 标签API (8)
- 模板消息API (5)
- 素材API (6)
- 客服消息API (7)
- 菜单API (4)
- 二维码API (2)
- 群发API (5)

## 参考链接
- https://github.com/IanShaw027/wemp-operator
